// src/api/routes/alerts.routes.js
const express = require('express');
const router = express.Router();
const { getDb } = require('../../db/setup');
const { apiKeyAuth } = require('../middleware/auth');
const alertService = require('../../services/alert.service');

router.get('/', apiKeyAuth, (req, res) => {
    const alerts = alertService.getUserAlerts(req.user.id);
    res.json({ alerts, count: alerts.length });
});

router.post('/', apiKeyAuth, (req, res) => {
    try {
        const { name, type, ticker, conditions, delivery, cooldownMin } = req.body;
        if (!name || !type) return res.status(400).json({ error: 'name and type required' });
        const created = alertService.createAlert(req.user.id, { name, type, ticker, conditions, delivery, cooldownMin });
        res.status(201).json({ alert: created });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

router.patch('/:id/toggle', apiKeyAuth, (req, res) => {
    const { enabled } = req.body;
    alertService.toggleAlert(req.params.id, req.user.id, !!enabled);
    res.json({ updated: true });
});

router.delete('/:id', apiKeyAuth, (req, res) => {
    alertService.deleteAlert(req.params.id, req.user.id);
    res.json({ deleted: true });
});

router.get('/history', apiKeyAuth, (req, res) => {
    const limit = Math.min(parseInt(req.query.limit || '50'), 200);
    const history = alertService.getAlertHistory(req.user.id, limit);
    res.json({ history, count: history.length });
});

module.exports = router;
