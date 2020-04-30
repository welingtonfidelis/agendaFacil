import React, { useState, useEffect } from 'react';
import { format, endOfMonth, startOfMonth, addDays } from 'date-fns';
import { makeStyles } from '@material-ui/core/styles';
import { IconButton } from '@material-ui/core';
import { Delete, Edit } from '@material-ui/icons';
import {
    TextField, Button, Select,
    InputLabel, MenuItem, FormControl
} from '@material-ui/core';

import ModalQuery from '../../components/ModalQuery';
import Load from '../../components/Load';

import api from '../../services/api';
import swal from '../../services/swal';

import './styles.scss'

const useStyles = makeStyles((theme) => ({
    formControl: {
        // margin: theme.spacing(1),
        minWidth: 120,
        paddingLeft: 5,
        paddingRight: 5,
        background: '#fff'
    }
}));

export default function Query() {
    const [queryList, setQueryList] = useState([]);
    const [medicList, setMedicList] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [queryEditId, setQueryEditId] = useState(0);
    const [medicId, setMedicId] = useState(0);
    const [dateStart, setDateStart] = useState(startOfMonth(new Date()));
    const [dateEnd, setDateEnd] = useState(endOfMonth(new Date()));
    const [loading, setLoading] = useState(false);
    const classes = useStyles();

    useEffect(() => {
        getListMedics();

    }, [])

    useEffect(() => {
        getListQuery();

    }, [dateStart, dateEnd, medicId]);

    async function getListQuery() {
        setLoading(true);

        try {
            setQueryEditId(0);
            const query = await api.get(
                `consultations` +
                `?date_gte=${format(dateStart, 'yyyy-MM-dd')}` +
                `&date_lte=${format(dateEnd, 'yyyy-MM-dd')}` +
                `${medicId > 0 ? `&medicId=${medicId}` : ''}` +
                `&_expand=medic` +
                `&_sort=date&_order=asc`
            );

            if (query) setQueryList(query.data);
            else swal.swalErrorInform(null, 'Houve um problema ao trazer a agenda de consultas.');

        } catch (error) {
            console.log(error);
            swal.swalErrorInform(null, 'Houve um problema ao trazer a agenda de consultas.');
        }

        setLoading(false);
    };

    async function getListMedics() {
        setLoading(true);

        try {
            const query = await api.get('medics');

            if (query.data) {
                setMedicList(query.data);
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

    function handleEditQuery(id) {
        setQueryEditId(id)
        setShowModal(true);
    }

    function handleNewQuery() {
        setQueryEditId(0)
        setShowModal(true);
    }

    async function handleDeleteQuery(id) {
        const resp = await swal.swalConfirm(null, 'Gostaria de excluir esta consulta?');

        if (resp) {
            setLoading(true);
            try {
                const query = await api.delete(`consultations/${id}`);

                if (query) {
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
                        <InputLabel id="medicId" className={classes.formControl}>Filtrar por médico</InputLabel>
                        <Select
                            required
                            fullWidth
                            labelId="Medico"
                            id="medicId"
                            value={medicId}
                            onChange={e => setMedicId(e.target.value)}
                        >
                            <MenuItem value={0}>Todos</MenuItem>
                            {medicList.map(el => (
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

            {queryList.map(item => {
                const { medic } = item;
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
                                    Contato: <span className="content-text">{item.phone}</span>
                                </span>
                                <span>
                                    Médico: <span className="content-text">{medic.name}</span>
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
            <ModalQuery
                showModal={showModal}
                setShowModal={setShowModal}
                id={queryEditId}
                reloadListFunction={getListQuery} />
        </>
    )
}