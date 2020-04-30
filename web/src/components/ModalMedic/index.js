import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
    Modal, Backdrop, Fade, TextField, Button
} from '@material-ui/core';
import { format } from 'date-fns';

import api from '../../services/api';
import swal from '../../services/swal';

import Load from '../Load';

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

export default function ModalMedic({ showModal, setShowModal, id, reloadListFunction }) {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [checkIn, setCheckIn] = useState(format(new Date(), 'HH:mm'));
    const [checkOut, setCheckOut] = useState(format(new Date(), 'HH:mm'));
    const [nameTmp, setNameTmp] = useState('');
    const [loading, setLoading] = useState(false);
    const classes = useStyles();

    useEffect(() => {
        if (id > 0) {
            getMedic();
        }
        else clearFields();

    }, [id]);

    function handleClose() {
        setShowModal(false);
    };

    async function getMedic() {
        setLoading(true);
        try {
            const query = await api.get(`medics/${id}`);
 
            if (query) {
                const { name, phone, checkIn, checkOut } = query.data;

                setName(name);
                setNameTmp(name);
                setPhone(phone);
                setCheckIn(format(new Date(`1990-07-28 ${checkIn}`), 'HH:mm'));
                setCheckOut(format(new Date(`1990-07-28 ${checkOut}`), 'HH:mm'));
            }

        } catch (error) {
            console.log(error);
            swal.swalErrorInform(
                null,
                'Houve um problem ao trazer as informações deste médico. Por favor, tente novamente'
            );
        }
        setLoading(false);
    }

    async function handleSubmit(event) {
        event.preventDefault();

        if (await checkNameMedic()) {
            setLoading(true);
            try {
                const data = {
                    name,
                    phone,
                    checkIn,
                    checkOut
                }

                let query = null;
                if (id > 0) query = await api.put(`medics/${id}`, data);
                else query = await api.post('medics', data);

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
        setName('');
        setPhone('');
        setCheckIn(format(new Date(), 'HH:mm'));
        setCheckOut(format(new Date(), 'HH:mm'));
        setNameTmp(null);
    }

    async function checkNameMedic() {
        let work = true;

        if (name !== nameTmp) {
            try {
                const query = await api.get(`medics?name_like=${name}`);

                if (query.data.length > 0) {
                    work = false;
                    swal.swalErrorInform(null, 'Este nome já está sendo utilizado. Por favor, use outro nome');
                }

            } catch (error) {
                console.log(error);
                work = false;
                swal.swalErrorInform();
            }
        }

        return work;
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
                        <h2>{id > 0 ? "Editar médico" : "Cadastrar médico"}</h2>

                        <div className="input-space flex-row input-date">
                            <TextField
                                fullWidth
                                required
                                id="name"
                                label="Nome"
                                variant="outlined"
                                value={name}
                                onChange={event => setName(event.target.value)}
                            />
                        </div>

                        <div className="input-space flex-row input-date">
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

                        <div className="flex-row input-space">
                            <TextField
                                fullWidth
                                required
                                type="time"
                                id="checkin"
                                label="Entrada"
                                variant="outlined"
                                value={checkIn}
                                onChange={event => setCheckIn(event.target.value)}
                            />

                            <TextField
                                fullWidth
                                required
                                type="time"
                                id="checkout"
                                label="Saída"
                                variant="outlined"
                                value={checkOut}
                                onChange={event => setCheckOut(event.target.value)}
                            />
                        </div>

                        <Button fullWidth className="btn-action" type="submit">Salvar</Button>
                    </form>
                </Fade>
            </Modal>
        </div>
    );
}