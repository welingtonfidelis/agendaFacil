import React, { useState, useEffect } from 'react';
import { format, endOfMonth, startOfMonth, addDays, getDaysInMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { makeStyles } from '@material-ui/core/styles';
import { IconButton } from '@material-ui/core';
import { Delete, Edit } from '@material-ui/icons';
import {
    TextField, Button, Select,
    InputLabel, MenuItem, FormControl
} from '@material-ui/core';
import ReactHtmlParser from 'react-html-parser';

import ModalQuery from '../../components/ModalQuery';

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

export default function QueryCalendar() {
    const [queryList, setQueryList] = useState([]);
    const [medicList, setMedicList] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [queryEditId, setQueryEditId] = useState(0);
    const [medicId, setMedicId] = useState(0);
    const [today, setToday] = useState(new Date());
    const classes = useStyles();

    useEffect(() => {
        getListMedics();

    }, [])

    useEffect(() => {
        getListQuery();

    }, [today, medicId]);

    async function getListQuery() {
        try {
            setQueryEditId(0);
            const start = startOfMonth(new Date(today)),
                end = endOfMonth(new Date(today));

            const query = await api.get(
                `consultations` +
                `?date_gte=${format(start,'yyyy-MM-dd')}` +
                `&date_lte=${format(end, 'yyyy-MM-dd')}` +
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
    };

    async function getListMedics() {
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
    };

    function handleNewQuery() {
        setQueryEditId(0)
        setShowModal(true);
    }

    function MountCalendar() {
        const week = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado']
        let bodyTmp = '<tr>', count = 0;
        const day = new Date(today);
        day.setDate(1);

        while (format(day, 'EEEE', { locale: ptBR }) !== week[count]) {
            count++;
            bodyTmp += '<th>&nbsp;</th>';
        }

        count = 0;
        for (let i = 1; i <= getDaysInMonth(new Date(today)); i++) {
            day.setDate(i);
            
            let control = true, query = ''
            do {
                if(queryList[count]) {
                    const { date } = queryList[count];
                    if(format(new Date(date), 'dd') === (i + '').padStart(2, '0')) {
                        const { patientName } = queryList[count];
                        query += 
                            `<span>
                                <strong>${format(new Date(date), 'HH:mm')}</strong> - ${patientName}
                            </span>`;
                        count ++;
                    }
                    else control = false;
                } 
                else control = false;
            } while (control);

            const tmp =
                `<div class="td-card">
                    <strong>${(i + '').padStart(2, '0')}</strong>
                    ${query}
                </div>`

            if (format(day, 'EEEE', { locale: ptBR }) === 'sábado') {
                bodyTmp +=
                        `<td>
                            ${tmp}
                        </td>
                    </tr>
                <tr>`
            }
            else {
                bodyTmp += `<td>${tmp}</td>`;
            }
        }

        let html =
            <table className="tb-calendar">
                <thead>
                    <tr>
                        {week.map(el => (
                            <th key={el}>{el}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {ReactHtmlParser(bodyTmp)}
                </tbody>
            </table>

        return html;
    }

    return (
        <>
            <div className="header-action header-query-action">
                <div className="header-query-content">
                    <TextField
                        fullWidth
                        required
                        type="month"
                        id="dateStart"
                        label="Data inicial"
                        variant="outlined"
                        value={format(new Date(today), 'yyyy-MM')}
                        onChange={event => setToday(addDays(new Date(event.target.value), 1))}
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
            <MountCalendar />

            <ModalQuery
                showModal={showModal}
                setShowModal={setShowModal}
                id={queryEditId}
                reloadListFunction={getListQuery} />
        </>
    )
}