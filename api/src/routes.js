const express = require('express');
const jwt = require('jsonwebtoken');
const routes = express.Router();

const DoctorController = require('./controllers/DoctorController');
const AppointmentController = require('./controllers/AppointmentController');
const UserController = require('./controllers/UserController');
const SessionController = require('./controllers/SessionController');

routes.post('/sign', SessionController.sessionSign);

//Validação de token para acesso às rotas
routes.use(verifyJWT);

routes.post('/doctors', DoctorController.store);
routes.put('/doctors/:id', DoctorController.update);
routes.get('/doctors', DoctorController.index);
routes.get('/doctors/byName', DoctorController.indexByName);
routes.get('/doctors/:id', DoctorController.show);
routes.delete('/doctors/:id', DoctorController.delete);

routes.post('/appointments', AppointmentController.store);
routes.put('/appointments/:id', AppointmentController.update);
routes.get('/appointments', AppointmentController.index);
routes.get('/appointments/byDate', AppointmentController.indexByDate);
routes.get('/appointments/:id', AppointmentController.show);
routes.delete('/appointments/:id', AppointmentController.delete);

routes.post('/users', UserController.store);
routes.put('/users/:id', UserController.update);
routes.get('/users', UserController.index);
routes.get('/users/byLogin', UserController.indexByLogin);
routes.get('/users/:id', UserController.show);
routes.delete('/users/:id', UserController.delete);

//Validação de Token para continuar a executar requisição
function verifyJWT(req, res, next) {
    let token = req.headers['token']

    if (!token) return res.status(200).send({ status: false, response: 'no token' });

    jwt.verify(token, process.env.SECRET, function (err, decoded) {
        if (err) return res.status(200).send({ status: false, response: 'invalid token' });
        req.body.UserId = decoded.id;
                
        // se tudo estiver ok, deixa a requisição prosseguir
        next()
    });
}

module.exports = routes;