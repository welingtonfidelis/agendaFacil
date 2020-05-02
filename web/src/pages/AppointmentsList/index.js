import React, { useState, useEffect } from 'react';
import { format, endOfMonth, startOfMonth, addDays } from 'date-fns';
import { makeStyles } from '@material-ui/core/styles';
import { IconButton } from '@material-ui/core';
import { Delete, Edit } from '@material-ui/icons';
import {
    TextField, Button, Select,
    InputLabel, MenuItem, FormControl
} from '@material-ui/core';
import { Pagination } from '@material-ui/lab';
import { useSelector } from 'react-redux';

import ModalAppointment from '../../components/ModalAppointment';
import Load from '../../components/Load';

import api from '../../services/api';
import swal from '../../services/swal';

import './styles.scss'

const useStyles = makeStyles((theme) => ({
    formControl: {
        minWidth: 120,
        paddingLeft: 5,
        paddingRight: 5,
        background: '#fff'
    }
}));

export default function AppointmentsList() {
    const userInfo = useSelector(state => state.data);
    const token = userInfo.token;
    const [appointmentList, setAppointmentList] = useState([]);
    const [doctorList, setDoctorList] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState(0);
    const [doctorId, setDoctorId] = useState(0);
    const [dateStart, setDateStart] = useState(startOfMonth(new Date()));
    const [dateEnd, setDateEnd] = useState(endOfMonth(new Date()));
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPage, setTotalPage] = useState(1);
    const classes = useStyles();

    useEffect(() => {
        getDoctorList();

    }, [])

    useEffect(() => {
        getListQuery();

    }, [dateStart, dateEnd, doctorId, page]);

    async function getListQuery() {
        setLoading(true);

        try {
            setEditId(0);

            const params = {
                start: format(dateStart, 'yyyy-MM-dd 00:00'),
                end: format(dateEnd, 'yyyy-MM-dd 23:59'),
                page
            }
            if (doctorId > 0) params['doctorId'] = doctorId;

            const query = await api.get(`appointments/byDate`,
                {
                    params,
                    headers: { token }
                });

            const { status, response, count } = query.data;
            if (status) {
                let tmp = ((count['count(*)']) / 10 + '').split('.');
                tmp = tmp[1] ? parseInt(tmp[0]) + 1 : tmp[0];

                setTotalPage(tmp);
                setAppointmentList(response);
            }
            else swal.swalErrorInform(null, 'Houve um problema ao trazer a agenda de consultas.');

        } catch (error) {
            console.log(error);
            swal.swalErrorInform(null, 'Houve um problema ao trazer a agenda de consultas.');
        }

        setLoading(false);
    };

    async function getDoctorList() {
        setLoading(true);

        try {
            const query = await api.get('doctors', { headers: { token } });

            const { status, response } = query.data;
            if (status) {
                setDoctorList(response);
            }

        } catch (error) {
            console.log(error);
            swal.swalErrorInform(
                null,
                'Houve um problema ao trazer a lista de médicos. Por favor, tente novamente'
            );
        }

        setLoading(false);
    };

    function handleEditQuery(id) {
        setEditId(id)
        setShowModal(true);
    }

    function handleNewQuery() {
        setEditId(0)
        setShowModal(true);
    }

    function clearId() {
        setEditId(0);
    }

    async function handleDeleteQuery(id) {
        const resp = await swal.swalConfirm(null, 'Gostaria de excluir esta consulta?');

        if (resp) {
            setLoading(true);
            try {
                const query = await api.delete(`appointments/${id}`, { headers: { token } });

                const { status } = query.data;
                if (status) {
                    getListQuery();
                    swal.swalInform(null, 'Consulta excluída com sucesso');
                }

            } catch (error) {
                console.log(error);
                swal.swalErrorInform(null, 'Houve um problema ao excluir a consulta.');
            }
            setLoading(false);
        }
    }

    return (
        <>
            <Load id="divLoading" loading={loading} />
            <div className="header-action header-query-action">
                <div className="header-query-content">
                    <TextField
                        fullWidth
                        required
                        type="date"
                        id="dateStart"
                        label="Data inicial"
                        variant="outlined"
                        value={format(dateStart, 'yyyy-MM-dd')}
                        onChange={event => setDateStart(addDays(new Date(event.target.value), 1))}
                    />

                    <TextField
                        fullWidth
                        required
                        type="date"
                        id="dateEnd"
                        label="Data final"
                        variant="outlined"
                        value={format(dateEnd, 'yyyy-MM-dd')}
                        onChange={event => setDateEnd(addDays(new Date(event.target.value), 1))}
                    />
                </div>

                <div className="header-query-content">
                    <FormControl variant="outlined" style={{ flex: 2 }}>
                        <InputLabel id="doctorId" className={classes.formControl}>Filtrar por médico</InputLabel>
                        <Select
                            required
                            fullWidth
                            labelId="Medico"
                            id="doctorId"
                            value={doctorId}
                            onChange={e => setDoctorId(e.target.value)}
                        >
                            <MenuItem value={0}>Todos</MenuItem>
                            {doctorList.map(el => (
                                <MenuItem key={el.id} value={el.id}>{el.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <Button
                        fullWidth
                        className="btn-action"
                        style={{ flex: 1 }}
                        onClick={handleNewQuery}
                    >
                        Novo
                    </Button>
                </div>
            </div>

            {appointmentList.map(item => {
                return (
                    <div className="flex-col content-query" key={item.id}>
                        <div className="flex-row">
                            <div className="flex-col content-query-date">
                                <span>{format(new Date(item.date), 'dd/MM/yyyy')}</span>
                                <span>{format(new Date(item.date), 'hh:mm')}</span>
                            </div>

                            <div className="flex-col content-query-info">
                                <span>
                                    Paciente: <span className="content-text">{item.patientName}</span>
                                    &nbsp;
                                    Contato: <span className="content-text">{item.patientPhone}</span>
                                </span>
                                <span>
                                    Médico: <span className="content-text">{item.doctorName}</span>
                                </span>
                            </div>

                            <div className="flex-col content-actions">
                                <IconButton
                                    onClick={() => handleEditQuery(item.id)}
                                    title="Editar"
                                    className="btn-icon-edit"
                                    aria-label="upload picture"
                                    component="span"
                                >
                                    <Edit />
                                </IconButton>
                                <IconButton
                                    onClick={() => handleDeleteQuery(item.id)}
                                    title="Deletar"
                                    className="btn-icon-del"
                                    aria-label="upload picture"
                                    component="span"
                                >
                                    <Delete />
                                </IconButton>
                            </div>
                        </div>

                    </div>
                )
            })}

            <div className="pagination">
                <Pagination
                    count={totalPage}
                    color="primary"
                    value={page}
                    onChange={(e, p) => setPage(p)}
                />
            </div>

            <ModalAppointment
                showModal={showModal}
                setShowModal={setShowModal}
                id={editId}
                clearId={clearId}
                reloadListFunction={getListQuery} />
        </>
    )
}