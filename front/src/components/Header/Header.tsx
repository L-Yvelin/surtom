import logoAnn from '../../assets/images/logo_ann.png';
import logo from '../../assets/images/logo_react.png';
import { JSX } from 'react';
import classes from './Header.module.css';
import { Theme } from '../Main/Tools/Tools';
import classNames from 'classnames';

interface HeaderProps {
  theme: Theme;
}

function Header({ theme }: HeaderProps): JSX.Element {
  return (
    <header
      id="haut"
      className={classNames(classes.header, {
        [classes.dark]: theme === Theme.DARK,
      })}
    >
      <a href={import.meta.env.VITE_FRONT_URL} className={classes.logoLink}>
        <img
          className={classes.logo}
          src={new Date().getDate() === 5 && new Date().getMonth() === 7 ? logoAnn : logo}
          alt="SURTOM MOT DU JOUR"
          draggable="false"
        />
      </a>
    </header>
  );
}

export default Header;
