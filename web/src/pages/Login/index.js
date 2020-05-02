import React, { useState } from 'react';
import { Button } from '@material-ui/core';
import { useDispatch } from 'react-redux';

import Load from '../../components/Load';

import api from '../../services/api';
import swal from '../../services/swal';

import './styles.scss';

export default function Login({ history }) {
    const Logo = `${process.env.PUBLIC_URL}/logo.png`;
    const [user, setUser] = useState('');
    const [password, setpassWord] = useState('');
    const [errorLogin, setErrorLogin] = useState(false);
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();

    async function handleSubmit(event) {
        event.preventDefault();
        setLoading(true);

        try {
            const query = await api.post('sign', {login: user, password});

            const {status, response} = query.data;
            console.log(response);
            if(status) {
                dispatch({ 
                    type: 'UPDATE_USER', 
                    user: {name: response.name, token: response.token} 
                });

                setLoading(false);
                history.push('/main');
                return;
            }
            else setErrorLogin(true);
            
        } catch (error) {
            console.log(error);
            swal.swalErrorInform(
                null,
                'Houve um problema ao efetuar o login. Por favor, tente novamente'
            );
        }
        
        setLoading(false);
    }

    return (
        <div className="body-login">
            <div className="container-login">
                <div className="content-login" id="box-login">
                    <Load loading={loading} />
                    <img className="logo-login" src={Logo} alt="Logo" />

                    <p>
                        Por favor, insira seu <strong>usuário</strong> e <strong>senha</strong> abaixo.
                    </p>

                    <form onSubmit={handleSubmit}>
                        <label htmlFor="user">Usuário</label>
                        <input
                            required
                            type="text"
                            id="user"
                            placeholder="seu usuário"
                            value={user}
                            onChange={event => setUser(event.target.value)}
                        />
                        <label htmlFor="password">Senha</label>
                        <input
                            required
                            autoComplete="on"
                            type="password"
                            id="password"
                            placeholder="*******"
                            value={password}
                            onChange={event => setpassWord(event.target.value)}
                        />

                        <Button type="submit" variant="contained" color="primary"> Entrar </Button>

                        {errorLogin ?
                            <span
                                className="invalid-login"
                                title="Por favor, vefique seus dados e tente novamente.">
                                Usuário ou senha inválidos
                        </span>
                            : ''
                        }
                    </form>
                </div>
            </div>
        </div>
    )
}