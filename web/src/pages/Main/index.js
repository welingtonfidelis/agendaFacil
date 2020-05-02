import React, { useState } from 'react';
import { BottomNavigation, BottomNavigationAction } from '@material-ui/core';
import { 
  Restore, AssignmentInd, 
  CalendarToday, ExitToApp, AccountCircle 
} from '@material-ui/icons';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useSelector, useDispatch } from 'react-redux';

import AppointmentsList from '../AppointmentsList';
import DoctorsList from '../DoctorsList';
import UsersList from '../UsersList';
import AppointmentsCalendar from '../AppointmentsCalendar';

import swal from '../../services/swal';

import './styles.scss';

export default function Main({history}) {
  const userInfo = useSelector(state => state.data);
  const dispatch = useDispatch();
  const [value, setValue] = useState('queryCalendar');
  const userName = userInfo.name

  const SelectPage = () => {
    let page = <AppointmentsCalendar />

    switch (value) {
      case 'query':
        page = <AppointmentsList />
        break;

      case 'medic':
        page = <DoctorsList />
        break;
      
      case 'user':
        page = <UsersList />
        break;

      default:
        break;
    }

    return page
  }

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  async function logout() {
    const resp = await swal.swalConfirm(userName, 'Gostaria de sair do sistema?');

    if (resp) {
      dispatch({
        type: 'UPDATE_USER',
        user: { name: '', token: '' }
      });
      history.push('/');
    }
  }

  return (
    <>
      <div className="header-main">
        <h2 className="header-main-title">{format(new Date(), 'dd - MMMM - yyyy', { locale: ptBR })}</h2>

        <div className="container-user">
          <h3 style={{ flex: 2 }}>Seja bem vindo(a), <span>&nbsp;&nbsp; {userName}</span></h3>
          <ExitToApp onClick={logout} titleAccess="Sair do sistema" />
        </div>

        <BottomNavigation value={value} onChange={handleChange} className="headerNavigation">
          <BottomNavigationAction label="Consultas" value="query" icon={<Restore />} />
          <BottomNavigationAction label="Calendário" value="queryCalendar" icon={<CalendarToday />} />
          <BottomNavigationAction label="Médicos" value="medic" icon={<AssignmentInd />} />
          <BottomNavigationAction label="Usuários" value="user" icon={<AccountCircle />} />
        </BottomNavigation>
      </div>

      <div className="container-global">
        <SelectPage />
      </div>
    </>
  );
}