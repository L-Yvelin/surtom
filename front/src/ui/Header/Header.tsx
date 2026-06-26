import logo from '../../assets/images/logo_world.png';
import { JSX } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import classes from './Header.module.css';
import { Theme } from '../../theme/theme';
import classNames from 'classnames';
import Splash from '../../routes/MainMenu/Splash/Splash';
import { RowBlockModel } from '../BlockModel/RowBlockModel';

interface HeaderProps {
  theme: Theme;
}

function Header({ theme }: HeaderProps): JSX.Element {
  const { t } = useTranslation();
  const route = useLocation();
  return (
    <header
      id="haut"
      className={classNames(classes.header, {
        [classes.dark]: theme === Theme.DARK,
      })}
    >
      <RowBlockModel className={classes.blocks} model={theme === Theme.DARK ? 'block/warped_nylium' : 'block/grass_block'} pitch={5} />
      <Link to="/" className={classes.logoLink}>
        <img className={classes.logo} src={logo} alt={t('header.logoAlt')} draggable="false" />
        {route.pathname === '/' && <Splash className={classes.splash} />}
      </Link>
    </header>
  );
}

export default Header;
