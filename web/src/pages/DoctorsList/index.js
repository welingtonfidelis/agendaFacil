import React, { useState, useEffect } from 'react';
import { IconButton } from '@material-ui/core';
import { Delete, Edit } from '@material-ui/icons';
import { TextField, Button } from '@material-ui/core';
import { Pagination } from '@material-ui/lab';
import { useSelector } from 'react-redux';

import ModalDoctor from '../../components/ModalDoctor';

import Load from '../../components/Load';

import api from '../../services/api';
import swal from '../../services/swal';

import medicLogo from '../../assets/image/medic.png';

import './styles.scss'

export default function DoctorsList() {
    const userInfo = useSelector(state => state.data);
    const token = userInfo.token;
    const [doctorList, setDoctorList] = useState([]);
    const [doctorListFull, setDoctorListFull] = useState([]);
    const [filter, setFilter] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [medicEditId, setMedicEditId] = useState(0);
    const [page, setPage] = useState(1);
    const [totalPage, setTotalPage] = useState(1);

    useEffect(() => {
        getListMedics();

    }, [page]);

    async function getListMedics() {
        setLoading(true);
        try {
            const query = await api.get('doctors',
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
                setDoctorList(response);
                setDoctorListFull(response);
            }

        } catch (error) {
            console.log(error);
            swal.swalErrorInform(null, 'Houve um problema ao trazer a lista de médicos.');
        }
        setLoading(false);
    }

    function handleEditMedic(id) {
        setMedicEditId(id)
        setShowModal(true);
    }

    function handleNewMedic() {
        setMedicEditId(0)
        setShowModal(true);
    }

    function clearId() {
        setMedicEditId(0);
    }

    async function handleDeleteMedic(id) {
        const resp = await swal.swalConfirm(null, 'Gostaria de excluir este médico?');

        if (resp) {
            setLoading(true);
            try {
                const query = await api.delete(`doctors/${id}`, { headers: { token } });

                const { status } = query.data;
                if (status) {
                    getListMedics();
                    swal.swalInform(null, 'Médico excluído com sucesso');
                }

            } catch (error) {
                console.log(error);
                swal.swalErrorInform(null, 'Houve um problema ao excluir o médico.');
            }
            setLoading(false);
        }
    }

    useEffect(() => {
        if (filter !== '') {
            const filtred = doctorListFull.filter((obj) => {
                obj.search = (obj.name ? obj.name.toLowerCase() : '')
                    + ' ' + (obj.phone ? obj.phone.toLowerCase() : '')
                    + ' ' + (obj.checkIn ? obj.checkIn.toLowerCase() : '')
                    + ' ' + (obj.checkOut ? obj.checkOut.toLowerCase() : '')

                return ((obj.search).indexOf(filter.toLowerCase()) > -1);
            })

            setDoctorList(filtred);
        }
        else setDoctorList(doctorListFull);
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
                        id="filterMedic"
                        label="Procurar"
                        variant="outlined"
                    />
                </div>

                <Button fullWidth className="btn-action" style={{ flex: 1 }} onClick={handleNewMedic}>Novo</Button>
            </div>

            {doctorList.map(item => {
                return (
                    <div className="flex-row content-medic" key={item.id}>
                        <div className="content-medic-image">
                            <img src={medicLogo} alt="logo médico" />
                        </div>

                        <div className="flex-col content-medic-info">
                            <span className="content-text">{item.name}</span>
                            <span className="content-text">{item.phone}</span>

                            <div className="flex-row">
                                <span>Entrada: <span className="content-text">{item.checkIn}</span></span>
                                &nbsp;
                                <span>Saída: <span className="content-text">{item.checkOut}</span></span>
                            </div>
                        </div>

                        <div className="flex-col content-actions">
                            <IconButton
                                onClick={() => handleEditMedic(item.id)}
                                title="Editar"
                                className="btn-icon-edit"
                                aria-label="upload picture"
                                component="span"
                            >
                                <Edit />
                            </IconButton>

                            <IconButton
                                onClick={() => handleDeleteMedic(item.id)}
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

            <ModalDoctor
                showModal={showModal}
                setShowModal={setShowModal}
                id={medicEditId}
                clearId={clearId}
                reloadListFunction={getListMedics} />
        </>
    )
}