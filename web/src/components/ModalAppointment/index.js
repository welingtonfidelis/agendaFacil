import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
    Modal, Backdrop, Fade, TextField,
    Button, Select, InputLabel, MenuItem
} from '@material-ui/core';
import {
    format, addMinutes, subMinutes,
    isEqual, compareAsc
} from 'date-fns';
import { useSelector } from 'react-redux';

import Load from '../Load';

import api from '../../services/api';
import swal from '../../services/swal';

import './styles.scss';

const useStyles = makeStyles((theme) => ({
    modal: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    paper: {
        backgroundColor: theme.palette.background.paper,
        border: '2px solid #000',
        boxShadow: theme.shadows[5],
        padding: theme.spacing(2, 4, 3),
    },
}));

export default function ModalAppointment({
    showModal, setShowModal, id,
    reloadListFunction, clearId
}) {
    const userInfo = useSelector(state => state.data);
    const token = userInfo.token;
    const [patientName, setPatientName] = useState('');
    const [patientPhone, setPatientPhone] = useState('');
    const [doctorId, setDoctorId] = useState('');
    const [doctorList, setDoctorList] = useState([]);
    const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [hour, setHour] = useState(format(new Date(), 'HH:mm'));
    const [dateTmp, setDateTmp] = useState(null);
    const [loading, setLoading] = useState(false);
    const classes = useStyles();

    useEffect(() => {
        getListMedics();

        if (id > 0) {
            getQuery();
        }
        else clearFields();

    }, [id]);

    async function getListMedics() {
        setLoading(true);
        try {
            const query = await api.get('doctors', { headers: { token }});

            const { status } = query.data;
            if (status) {
                const { response } = query.data;
                setDoctorList(response);
                if (response.length > 0) setDoctorId(response[0].id);
            }

        } catch (error) {
            console.log(error);
            swal.swalErrorInform(
                null,
                'Houve um problem ao trazer a lista de médicos. Por favor, tente novamente'
            );
        }
        setLoading(false);
    };

    async function getQuery() {
        setLoading(true);
        try {
            const query = await api.get(`appointments/${id}`, { headers: { token }});

            const { status } = query.data;
            if (status) {
                const { response } = query.data;

                setPatientName(response.patientName);
                setPatientPhone(response.patientPhone);
                setDate(format(new Date((response.date)), 'yyyy-MM-dd'));
                setDateTmp(format(new Date((response.date)), 'yyyy-MM-dd HH:mm'));
                setHour(format(new Date((response.date)), 'HH:mm'));
                setDoctorId(response.doctorId);
            }

        } catch (error) {
            console.log(error);
            swal.swalErrorInform(
                null,
                'Houve um problem ao trazer as informações desta consulta. Por favor, tente novamente'
            );
        }
        setLoading(false);
    }

    function handleClose() {
        clearFields();
        setShowModal(false);
    };

    async function handleSubmit(event) {
        event.preventDefault();
        if (doctorId !== '') {
            if (checkHourMedic() && await checkDateQuery()) {
                setLoading(true);
                try {
                    const data = {
                        patientName,
                        patientPhone,
                        date: format(new Date(`${date} ${hour}`), 'yyyy-MM-dd HH:mm'),
                        doctorId
                    }

                    let query = null;
                    if (id > 0) query = await api.put(`appointments/${id}`, { data }, { headers: { token }});
                    else query = await api.post('appointments', { data }, { headers: { token }});

                    if (query) {
                        swal.swalInform();
                        clearFields();
                        reloadListFunction();
                        handleClose();
                    }

                } catch (error) {
                    console.log(error);
                    swal.swalErrorInform();
                }
                setLoading(false);
            }
        }
        else swal.swalErrorInform();
    }

    function clearFields() {
        setPatientName('');
        setPatientPhone('');
        setDoctorId('');
        setDate(format(new Date(), 'yyyy-MM-dd'));
        setHour(format(new Date(), 'HH:mm'));
        setDateTmp(null);
        if (clearId) clearId();
    }

    function checkHourMedic() {
        let work = true;

        for (const item of doctorList) {
            if (item.id === doctorId) {
                if (compareAsc(
                    new Date(`1990-07-28 ${hour}`),
                    new Date(`1990-07-28 ${item.checkIn}`)) >= 0) {
                    if (compareAsc(
                        new Date(`1990-07-28 ${item.checkOut}`),
                        new Date(`1990-07-28 ${hour}`)) >= 0) {
                    }
                    else {
                        swal.swalErrorInform(null, `O médico atende até as ${item.checkOut}.`);
                        work = false;
                    }
                }
                else {
                    swal.swalErrorInform(null, `O médico atende a partir das ${item.checkIn}.`);
                    work = false;
                }

                break;
            }
        }

        return work;
    }

    async function checkDateQuery() {
        let free = true;

        try {
            let dateQuery = new Date(`${date} ${hour}`),
                start = subMinutes(dateQuery, 30),
                end = addMinutes(dateQuery, 30);

            const query = await api.get(
                `appointments/byDate` +
                `?start=${format(start, 'yyyy-MM-dd HH:mm')}` +
                `&end=${format(end, 'yyyy-MM-dd HH:mm')}` +
                `&doctorId=${doctorId}`,
                { headers: { token }}
            );

            const { status } = query.data;

            if (status) {
                const { response } = query.data;

                for (const el of response) {
                    if (!isEqual(new Date(el.date), new Date(dateTmp))
                        && isEqual(new Date(el.date), new Date(dateQuery))) {
                        free = false;
                        break;
                    }
                }

                if (free) {
                    const resp = await swal.swalConfirm(
                        'Cuidado',
                        'Existe cosulta com horário próximo ao escolhido (30 minutos ou menos). ' +
                        'Ainda gostaria de salvar esta consulta?');

                    if (!resp) free = false;
                }
                else swal.swalErrorInform(null, 'Já existe uma consulta nesta data e hora escolhida');
            }

        } catch (error) {
            console.log(error);
            free = false;
            swal.swalErrorInform();
        }

        return free;
    }

    return (
        <div>
            <Modal
                aria-labelledby="transition-modal-title"
                aria-describedby="transition-modal-description"
                className={classes.modal}
                open={showModal}
                onClose={handleClose}
                closeAfterTransition
                BackdropComponent={Backdrop}
                BackdropProps={{
                    timeout: 500,
                }}
            >
                <Fade in={showModal}>

                    <form id="form-modal" onSubmit={handleSubmit} className={classes.paper}>
                        <Load id="divLoading" loading={loading} />
                        <h2>{id > 0 ? "Editar consulta" : "Cadastrar consulta"}</h2>

                        <div className="input-space">
                            <InputLabel id="doctorId">Médico</InputLabel>
                            <Select
                                required
                                fullWidth
                                labelId="doctorId"
                                id="doctorId"
                                value={doctorId}
                                onChange={e => setDoctorId(e.target.value)}
                            >
                                {doctorList.map(el => (
                                    <MenuItem key={el.id} value={el.id}>{el.name}</MenuItem>
                                ))}
                            </Select>
                        </div>

                        <div className="input-space flex-row input-date">
                            <TextField
                                fullWidth
                                required
                                type="date"
                                id="date"
                                label="Data"
                                variant="outlined"
                                value={date}
                                onChange={event => setDate(event.target.value)}
                            />

                            <TextField
                                fullWidth
                                required
                                type="time"
                                id="hour"
                                label="Horário"
                                variant="outlined"
                                value={hour}
                                onChange={event => setHour(event.target.value)}
                            />
                        </div>

                        <div className="input-space">
                            <TextField
                                required
                                fullWidth
                                value={patientName}
                                onChange={e => setPatientName(e.target.value)}
                                id="patientName"
                                label="Paciente"
                                variant="outlined"
                            />
                        </div>

                        <div className="input-space">
                            <TextField
                                required
                                fullWidth
                                value={patientPhone}
                                onChange={e => setPatientPhone(e.target.value)}
                                id="patientPhone"
                                label="Telefone"
                                variant="outlined"
                                type="number"
                            />
                        </div>

                        <Button fullWidth className="btn-action" type="submit">Salvar</Button>
                    </form>
                </Fade>
            </Modal>
        </div>
    );
}