import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
    Modal, Backdrop, Fade, FormControlLabel,
    TextField, Button, Switch
} from '@material-ui/core';
import { useSelector } from 'react-redux';

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

export default function ModalUser({
    showModal, setShowModal, id,
    reloadListFunction, clearId
}) {
    const userInfo = useSelector(state => state.data);
    const token = userInfo.token;
    const [name, setName] = useState('');
    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [loginTmp, setLoginTmp] = useState('');
    const [loading, setLoading] = useState(false);
    const [updatePass, setUpdatePass] = useState(false);
    const classes = useStyles();

    useEffect(() => {
        if (id > 0) {
            setUpdatePass(false);
            getUser();
        }
        else {
            setUpdatePass(true);
            clearFields();
        }

    }, [id]);

    function handleClose() {
        setShowModal(false);
    };

    async function getUser() {
        setLoading(true);
        try {
            const query = await api.get(`users/${id}`, { headers: { token } });

            const { status, response } = query.data;
            if (status) {
                const { name, login } = response;
                setName(name);
                setLogin(login);
                setLoginTmp(login);
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

        if (await checkLogin()) {
            setLoading(true);
            try {
                let data = {
                    name,
                    login,
                }

                let query = null;
                if (id > 0) {
                    if(updatePass) data.password = password;
                    query = await api.put(`users/${id}`, { data }, { headers: { token } });
                }
                else {
                    data.password = password;
                    query = await api.post('users', { data }, { headers: { token } });
                }

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
        setLogin('');
        setPassword('');
        setPasswordConfirm('');

        if (clearId) clearId();
    }

    async function checkLogin() {
        let work = true;

        if (login !== loginTmp) {
            try {
                const query = await api.get(`users/byLogin`,
                    {
                        params: { login },
                        headers: { token }
                    });

                const { status, response } = query.data;
                if (status && response.length > 0) {
                    work = false;
                    swal.swalErrorInform(
                        null,
                        'Este login já está sendo utilizado. Por favor, use outro'
                    );
                }

            } catch (error) {
                console.log(error);
                work = false;
                swal.swalErrorInform();
            }
        }

        return work;
    }

    function checkPassword() {
        const div = document.getElementById("passwordConfirm")

        if (password !== passwordConfirm) {
            div.setCustomValidity("Repita sua senha")
        } else div.setCustomValidity("")
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
                        <h2>{id > 0 ? "Editar usuário" : "Cadastrar usuário"}</h2>

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
                                value={login}
                                onChange={e => setLogin(e.target.value)}
                                id="login"
                                label="Login"
                                variant="outlined"
                            />
                        </div>

                        {id > 0 ?
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={updatePass}
                                        onChange={() => setUpdatePass(!updatePass)}
                                        color="primary"
                                    />
                                }
                                label="Alterar senha"
                            /> : null}

                        {updatePass ?
                            <>
                                <div className=" input-space">
                                    <TextField
                                        fullWidth
                                        required
                                        type="password"
                                        id="password"
                                        label="Senha"
                                        variant="outlined"
                                        value={password}
                                        onChange={event => setPassword(event.target.value)}
                                    />
                                </div>

                                <div className=" input-space">
                                    <TextField
                                        fullWidth
                                        required
                                        type="password"
                                        id="passwordConfirm"
                                        label="Confirmar senha"
                                        variant="outlined"
                                        value={passwordConfirm}
                                        onBlur={checkPassword}
                                        onChange={event => setPasswordConfirm(event.target.value)}
                                    />
                                </div>
                            </>
                            : null}

                        <Button fullWidth className="btn-action" type="submit">Salvar</Button>
                    </form>
                </Fade>
            </Modal>
        </div>
    );
}