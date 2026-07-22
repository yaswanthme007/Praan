import pytest
from app.engine.scoring import evaluate_compound_risk

def test_nominal_safety_score():
    """
    Under normal operations with no alerts, no active permits, and low sensor readings,
    the compound risk score should be in the safe band.
    """
    sensors = [
        {"type": "GAS", "value": 5.0, "warn_threshold": 25.0, "crit_threshold": 45.0, "status": "safe", "history": [5.0, 5.0, 5.0, 5.0]},
        {"type": "OXYGEN", "value": 20.9, "warn_threshold": 19.0, "crit_threshold": 17.5, "status": "safe", "history": [20.9, 20.9, 20.9, 20.9]}
    ]
    workers = [{"status": "ACTIVE"}]
    permits = []
    maintenances = []

    res = evaluate_compound_risk("Z-01", sensors, workers, permits, maintenances)
    
    assert res["score"] < 30
    assert res["band"] == "safe"
    assert res["triggeredRule"] is None

def test_single_sensor_warning_no_interaction():
    """
    When a single sensor is elevated (e.g. GAS is 28ppm, crossing the 25ppm warn limit),
    but there are no active permits or high worker counts, the risk is contained
    and should not trigger a CRITICAL band.
    """
    sensors = [
        {"type": "GAS", "value": 28.0, "warn_threshold": 25.0, "crit_threshold": 45.0, "status": "elevated", "history": [20.0, 23.0, 26.0, 28.0]},
        {"type": "OXYGEN", "value": 20.9, "warn_threshold": 19.0, "crit_threshold": 17.5, "status": "safe", "history": [20.9, 20.9, 20.9, 20.9]}
    ]
    workers = [{"status": "ACTIVE"}] # Only 1 worker
    permits = [] # No permits
    maintenances = []

    res = evaluate_compound_risk("Z-01", sensors, workers, permits, maintenances)
    
    # Gas is elevated, trajectory is up, but no permits, so it stays moderate (watch or elevated)
    assert res["score"] < 75 # Should NOT be critical
    assert res["band"] in ["watch", "elevated"]
    assert res["triggeredRule"] is None

def test_compound_risk_interaction_critical():
    """
    When a gas level is elevated (28ppm, sub-critical) AND a HOT WORK permit is active
    AND multiple workers are present (3 workers), the Compound Risk Engine should
    fire the CR-014 triplet interaction bonus, raising the risk to CRITICAL immediately.
    """
    sensors = [
        {"type": "GAS", "value": 28.0, "warn_threshold": 25.0, "crit_threshold": 45.0, "status": "elevated", "history": [20.0, 23.0, 26.0, 28.0]},
        {"type": "OXYGEN", "value": 20.9, "warn_threshold": 19.0, "crit_threshold": 17.5, "status": "safe", "history": [20.9, 20.9, 20.9, 20.9]}
    ]
    workers = [
        {"status": "ACTIVE"},
        {"status": "ACTIVE"},
        {"status": "ACTIVE"} # 3 active workers
    ]
    permits = [
        {"type": "HOT WORK", "status": "ACTIVE"}
    ]
    maintenances = []

    res = evaluate_compound_risk("Z-01", sensors, workers, permits, maintenances)
    
    assert res["score"] >= 75
    assert res["band"] == "critical"
    assert res["triggeredRule"] is not None
    assert res["triggeredRule"]["code"] == "CR-014"
    assert "r1" in res["triggeredRule"]["id"] or res["triggeredRule"]["id"] == "r1"
