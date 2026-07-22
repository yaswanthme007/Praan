import numpy as np
from typing import List, Dict, Any, Tuple

def calculate_sensor_trajectory(history: List[float]) -> float:
    """
    Computes a simple trajectory slope (rate of change) from the last 4 readings.
    Positive value indicates upward trend, negative indicates downward.
    """
    if len(history) < 2:
        return 0.0
    recent = history[-4:]
    if len(recent) < 2:
        return 0.0
    # Simple rate of change: (last - first_of_recent) / index_diff
    return (recent[-1] - recent[0]) / (len(recent) - 1)

def evaluate_compound_risk(
    zone_code: str,
    sensors: List[Dict[str, Any]],
    workers: List[Dict[str, Any]],
    permits: List[Dict[str, Any]],
    maintenances: List[Dict[str, Any]],
    is_shift_change: bool = False
) -> Dict[str, Any]:
    """
    Executes the Compound Risk Engine calculations for a specific zone.
    Returns: {
        "score": int (0-100),
        "band": str ("safe" | "watch" | "elevated" | "critical"),
        "topFactors": List[str],
        "triggeredRule": Optional[Dict[str, Any]],
        "leadTimeMin": int,
        "recommendedAction": str
    }
    """
    # 1. Normalize Inputs in [0, 1]
    g = 0.0       # Gas risk contribution
    g_dot = 0.0   # Gas trajectory factor
    p = 0.0       # Permit hazard weight
    m = 0.0       # Maintenance state
    w = 0.0       # Worker exposure density
    s = 0.0       # Process abnormality factor
    c = 0.3 if is_shift_change else 0.0 # Handover load factor

    # Detail extractions for rules/explanations
    max_gas_ppm = 0.0
    gas_trend_up = False
    active_hot_work = False
    active_confined_space = False
    active_permits_count = 0
    worker_count = len([wrk for wrk in workers if wrk.get("status") in ["ACTIVE", "EMERGENCY"]])
    has_critical_sensor = False
    o2_depleted = False
    o2_val = 20.9
    vibration_spike = False
    pressure_high = False

    # A. Process Sensors
    for sens in sensors:
        stype = sens.get("type", "")
        val = sens.get("value", 0.0)
        history = sens.get("history", [])
        warn_th = sens.get("warn_threshold", 1.0)
        crit_th = sens.get("crit_threshold", 1.0)
        status = sens.get("status", "safe")

        if status == "critical":
            has_critical_sensor = True

        if stype == "GAS":
            max_gas_ppm = max(max_gas_ppm, val)
            ratio = val / crit_th
            g = max(g, min(1.0, ratio))
            
            slope = calculate_sensor_trajectory(history)
            if slope > 0.1:
                g_dot = max(g_dot, min(1.0, slope * 2.0))
                gas_trend_up = True

        elif stype == "OXYGEN":
            o2_val = val
            if val < 19.5:
                o2_depleted = True
                # Oxygen depletion risk increases as O2 drops
                ratio = (20.9 - val) / (20.9 - 16.0)
                g = max(g, min(1.0, ratio))
                
                slope = calculate_sensor_trajectory(history)
                if slope < -0.05: # trending down
                    g_dot = max(g_dot, min(1.0, abs(slope) * 4.0))

        elif stype == "PRESSURE":
            if val > warn_th:
                pressure_high = True
                ratio = val / crit_th
                s = max(s, min(0.8, ratio))

        elif stype == "VIBRATION":
            if val > warn_th:
                vibration_spike = True
                ratio = val / crit_th
                s = max(s, min(0.8, ratio))

    # B. Process Permits
    for permit in permits:
        if permit.get("status") == "ACTIVE":
            active_permits_count += 1
            ptype = permit.get("type", "")
            if ptype == "HOT WORK":
                active_hot_work = True
                p = max(p, 0.8)
            elif ptype == "CONFINED SPACE":
                active_confined_space = True
                p = max(p, 0.9)
            elif ptype in ["HEIGHT", "ELECTRICAL", "EXCAVATION"]:
                p = max(p, 0.5)

    # C. Process Maintenance
    for maint in maintenances:
        if maint.get("status") == "IN PROGRESS":
            m = 1.0

    # D. Process Workers
    w = min(1.0, worker_count / 5.0)

    # E. Process Abnormality general fallback
    if has_critical_sensor:
        s = max(s, 0.7)

    # 2. Score Computation (Weights matching design system)
    w_gas = 0.3
    w_traj = 0.2
    w_perm = 0.25
    w_maint = 0.15
    w_work = 0.1
    w_proc = 0.1
    w_shift = 0.05

    base_score = (
        w_gas * g +
        w_traj * g_dot +
        w_perm * p +
        w_maint * m +
        w_work * w +
        w_proc * s +
        w_shift * c
    ) * 60.0 # Normalize base to [0, 60] scale

    # 3. Interaction Terms (Pairwise & Triplets)
    interaction_bonus = 0.0
    top_factors = []
    triggered_rule = None

    # Rule CR-014: Hot Work + Rising HC + Workers present (Vizag pattern)
    if active_hot_work and max_gas_ppm > 25.0 and worker_count >= 3:
        # High triplet interaction
        interaction_bonus += 37.0
        top_factors.append("Active Hot Work Permit in presence of rising Hydrocarbon gas")
        top_factors.append("High worker exposure density (≥3 workers in risk zone)")
        triggered_rule = {
            "id": "r1",
            "code": "CR-014",
            "name": "Hot Work + Rising Hydrocarbon + Workers In Zone",
            "regulation": "OSHA 1910.119 · IS 15656",
            "details": "Lethal combination of heat source (weld/grind) + flammable vapors + worker exposure."
        }

    # Rule CR-021: Confined Space + O2 depletion + Maintenance running
    elif active_confined_space and o2_depleted and m > 0:
        interaction_bonus += 32.0
        top_factors.append("Active Confined Space entry during ongoing equipment maintenance")
        top_factors.append(f"Oxygen depletion trend detected ({o2_val}%)")
        triggered_rule = {
            "id": "r2",
            "code": "CR-021",
            "name": "Confined Space + Falling O₂ + Maintenance Running",
            "regulation": "OSHA 1910.146",
            "details": "High hazard risk of atmospheric suffocation under restricted escape conditions."
        }

    # Rule CR-008: Overpressure + Vibration Spike
    elif pressure_high and vibration_spike:
        interaction_bonus += 27.0
        top_factors.append("Mechanical fatigue indicator: simultaneous Overpressure and Vibration spike")
        triggered_rule = {
            "id": "r3",
            "code": "CR-008",
            "name": "Overpressure + Vibration Spike",
            "regulation": "API 618",
            "details": "Reciprocating compressor hazard window due to structural vibration coupled with process pressure."
        }

    # Generic Pairwise interaction fallback if no rules triggered
    else:
        # Gas accumulation + Hot Work
        if active_hot_work and g > 0.3:
            interaction_bonus += 15.0
            top_factors.append("Co-occurrence of flammables accumulation and hot work permit")
        # Confined space + Maintenance
        if active_confined_space and m > 0:
            interaction_bonus += 10.0
            top_factors.append("Active maintenance within confined space")
        # Workers + Rising gas
        if worker_count > 0 and g_dot > 0.3:
            interaction_bonus += 12.0
            top_factors.append("Worker presence in zone with rising gas accumulation trend")

    # Assemble final score
    total_score = min(100.0, base_score + interaction_bonus)
    score_int = int(round(total_score))

    # Determine Severity Band
    if score_int >= 75:
        band = "critical"
        lead_time = int(12 - (g_dot * 8)) # Trajectory shortens lead time
        lead_time = max(2, lead_time)
        recommended_action = "EVACUATE ZONE IMMEDIATELY. Halt all work permits, isolate SCADA valves, and deploy Response Team."
    elif score_int >= 55:
        band = "elevated"
        lead_time = int(35 - (g_dot * 15))
        recommended_action = "Suspend Hot Work permits. Conduct visual check, start local ventilation blowers, and notify Safety Lead."
    elif score_int >= 30:
        band = "watch"
        lead_time = 60
        recommended_action = "Review gas sensor calibration logs. Monitor zone telemetry closely on SCADA."
    else:
        band = "safe"
        lead_time = 120
        recommended_action = "Routine operations. Ensure workers carry RFID badges."

    # Populate top default factors if list is empty
    if not top_factors:
        if g > 0.4:
            top_factors.append("Elevated sensor telemetry")
        if p > 0.0:
            top_factors.append("Active Permit-to-Work activity")
        if m > 0.0:
            top_factors.append("Scheduled equipment maintenance loop active")
        if not top_factors:
            top_factors.append("Baseline nominal facility conditions")

    return {
        "score": score_int,
        "band": band,
        "topFactors": top_factors,
        "triggeredRule": triggered_rule,
        "leadTimeMin": lead_time,
        "recommendedAction": recommended_action
    }
