const express = require('express');
const routes = express.Router();

const DoctorController = require('./controllers/DoctorController');
const AppointmentController = require('./controllers/AppointmentController');

routes.post('/doctors', DoctorController.store);
routes.put('/doctors/:id', DoctorController.update);
routes.get('/doctors', DoctorController.index);
routes.get('/doctors/:id', DoctorController.show);
routes.delete('/doctors/:id', DoctorController.delete);

routes.post('/appointments', AppointmentController.store);
routes.put('/appointments/:id', AppointmentController.update);
routes.get('/appointments', AppointmentController.index);
routes.get('/appointments/:id', AppointmentController.show);
routes.delete('/appointments/:id', AppointmentController.delete);

module.exports = routes;