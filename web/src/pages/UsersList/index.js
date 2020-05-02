import React, { useState, useEffect } from 'react';
import { IconButton } from '@material-ui/core';
import { Delete, Edit } from '@material-ui/icons';
import { TextField, Button } from '@material-ui/core';
import { Pagination } from '@material-ui/lab';
import { useSelector } from 'react-redux';

import ModalUser from '../../components/ModalUser';

import Load from '../../components/Load';

import api from '../../services/api';
import swal from '../../services/swal';

import userLogo from '../../assets/image/user.png';

import './styles.scss'

export default function UsersList() {
    const userInfo = useSelector(state => state.data);
    const token = userInfo.token;
    const [userList, setUserList] = useState([]);
    const [userListFull, setUserListFull] = useState([]);
    const [filter, setFilter] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [userEditId, setUserEditId] = useState(0);
    const [page, setPage] = useState(1);
    const [totalPage, setTotalPage] = useState(1);

    useEffect(() => {
        getListUser();

    }, [page]);

    async function getListUser() {
        setLoading(true);
        try {
            const query = await api.get('users',
                { 
                    params: { page },
                    headers: { token }
                }
            );

            const { status, response, count } = query.data;
            if (status) {
                let tmp = ((count['count(*)']) / 10 + '').split('.');
                tmp = tmp[1] ? parseInt(tmp[0]) + 1 : tmp[0];

                setTotalPage(tmp);
                setUserList(response);
                setUserListFull(response);
            }

        } catch (error) {
            console.log(error);
            swal.swalErrorInform(null, 'Houve um problema ao trazer a lista de usuários.');
        }
        setLoading(false);
    }

    function handleUserEdit(id) {
        setUserEditId(id)
        setShowModal(true);
    }

    function handleNewMedic() {
        setUserEditId(0)
        setShowModal(true);
    }

    function clearId() {
        setUserEditId(0);
    }

    async function handleDeleteUser(id) {
        const resp = await swal.swalConfirm(null, 'Gostaria de excluir este usuário?');

        if (resp) {
            setLoading(true);
            try {
                const query = await api.delete(`users/${id}`, { headers: { token } });

                const { status } = query.data;
                if (status) {
                    getListUser();
                    swal.swalInform(null, 'Usuário excluído com sucesso');
                }

            } catch (error) {
                console.log(error);
                swal.swalErrorInform(null, 'Houve um problema ao excluir o usuário.');
            }
            setLoading(false);
        }
    }

    useEffect(() => {
        if (filter !== '') {
            const filtred = userListFull.filter((obj) => {
                obj.search = (obj.name ? obj.name.toLowerCase() : '')
                    + ' ' + (obj.login ? obj.login.toLowerCase() : '')

                return ((obj.search).indexOf(filter.toLowerCase()) > -1);
            })

            setUserList(filtred);
        }
        else setUserList(userListFull);
    }, [filter]);

    return (
        <>
            <Load id="divLoading" loading={loading} />
            <div className="header-medic-content">
                <div className="header-action-search">
                    <TextField
                        required
                        fullWidth
                        value={filter}
                        onChange={e => setFilter(e.target.value)}
                        id="filterUser"
                        label="Procurar"
                        variant="outlined"
                    />
                </div>

                <Button fullWidth className="btn-action" style={{ flex: 1 }} onClick={handleNewMedic}>Novo</Button>
            </div>

            {userList.map(item => {
                return (
                    <div className="flex-row content-medic" key={item.id}>
                        <div className="content-medic-image">
                            <img src={userLogo} alt="logo usuário" />
                        </div>

                        <div className="flex-col content-medic-info">
                            <span className="content-text">{item.name}</span>
                            <span className="content-text">{item.login}</span>
                        </div>

                        <div className="flex-col content-actions">
                            <IconButton
                                onClick={() => handleUserEdit(item.id)}
                                title="Editar"
                                className="btn-icon-edit"
                                aria-label="upload picture"
                                component="span"
                            >
                                <Edit />
                            </IconButton>

                            <IconButton
                                onClick={() => handleDeleteUser(item.id)}
                                title="Deletar"
                                className="btn-icon-del"
                                aria-label="upload picture"
                                component="span"
                            >
                                <Delete />
                            </IconButton>
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

            <ModalUser
                showModal={showModal}
                setShowModal={setShowModal}
                id={userEditId}
                clearId={clearId}
                reloadListFunction={getListUser} />
        </>
    )
}