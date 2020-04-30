import React from 'react';
import { BottomNavigation, BottomNavigationAction } from '@material-ui/core';
import { Restore, AssignmentInd, CalendarToday } from '@material-ui/icons';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import Query from '../QueryList';
import Medic from '../Medic';
import QueryCalendar from '../QueryCalendar';

import './styles.scss';

export default function Main() {
  const [value, setValue] = React.useState('queryCalendar');

  const SelectPage = () => {
    let page = <QueryCalendar />

    switch (value) {
      case 'query':
        page = <Query />
        break;

      case 'medic':
        page = <Medic />
        break;

      default:
        break;
    }

    return page
  }

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <>
      <div className="header-main">
        <h2 className="header-main-title">{format(new Date(), 'dd - MMMM - yyyy', { locale: ptBR })}</h2>
        <BottomNavigation value={value} onChange={handleChange} className="headerNavigation">
          <BottomNavigationAction label="Consultas" value="query" icon={<Restore />} />
          <BottomNavigationAction label="Calendário" value="queryCalendar" icon={<CalendarToday />} />
          <BottomNavigationAction label="Médicos" value="medic" icon={<AssignmentInd />} />
        </BottomNavigation>
      </div>

      <div className="container-global">
        <SelectPage />
      </div>
    </>
  );
}