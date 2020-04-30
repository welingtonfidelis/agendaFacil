import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
    Modal, Backdrop, Fade, TextField,
    Button, Select, InputLabel, MenuItem
} from '@material-ui/core';
import { format, addMinutes, subMinutes, isEqual, compareAsc } from 'date-fns';

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

export default function ModalQuery({ showModal, setShowModal, id, reloadListFunction }) {
    const [patientName, setPatientName] = useState('');
    const [phone, setPhone] = useState('');
    const [medicId, setMedicId] = useState(0);
    const [listMedic, setListMedic] = useState([]);
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
            const query = await api.get('medics');

            if (query.data) {
                setListMedic(query.data);
                setMedicId(query.data[0].id);
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
            const query = await api.get(`consultations/${id}`);

            if (query) {
                const { patientName, phone, date, medicId } = query.data;
                console.log('data', date.split(' '));

                setPatientName(patientName);
                setPhone(phone);
                setDate(format(new Date((date)), 'yyyy-MM-dd'));
                setDateTmp(format(new Date((date)), 'yyyy-MM-dd HH:mm'));
                setHour(format(new Date((date)), 'HH:mm'));
                setMedicId(medicId);
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
        setShowModal(false);
    };

    async function handleSubmit(event) {
        event.preventDefault();

        if (checkHourMedic() && await checkDateQuery()) {
            setLoading(true);
            try {
                const data = {
                    patientName,
                    phone,
                    date: format(new Date(`${date} ${hour}`), 'yyyy-MM-dd HH:mm'),
                    medicId
                }

                let query = null;
                if (id > 0) query = await api.put(`consultations/${id}`, data);
                else query = await api.post('consultations', data);

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

    function clearFields() {
        setPatientName('');
        setPhone('');
        setMedicId(0);
        setDate(format(new Date(), 'yyyy-MM-dd'));
        setHour(format(new Date(), 'HH:mm'));
        setDateTmp(null);
    }

    function checkHourMedic() {
        let work = true;

        for (const item of listMedic) {
            if (item.id === medicId) {
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
                dateStart = subMinutes(dateQuery, 30),
                dateEnd = addMinutes(dateQuery, 30);

            const query = await api.get(
                `consultations` +
                `?date_gte=${format(dateStart, 'yyyy-MM-dd HH:mm')}` +
                `&date_lte=${format(dateEnd, 'yyyy-MM-dd HH:mm')}` +
                `&medicId=${medicId}`
            );

            if (query.data && query.data.length > 0) {
                for (const el of query.data) {
                    console.log(dateTmp, dateQuery, el.date);

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
                            <InputLabel id="medicId">Médico</InputLabel>
                            <Select
                                required
                                fullWidth
                                labelId="medicId"
                                id="medicId"
                                value={medicId}
                                onChange={e => setMedicId(e.target.value)}
                            >
                                {listMedic.map(el => (
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
                                value={phone}
                                onChange={e => setPhone(e.target.value)}
                                id="phone"
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