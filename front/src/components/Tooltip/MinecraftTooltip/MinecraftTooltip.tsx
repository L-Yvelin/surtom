import React, { JSX } from 'react';
import classes from './MinecraftTooltip.module.css';
import classNames from 'classnames';

interface MinecraftTooltipProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  children: string | JSX.Element;
}

function MinecraftTooltip({ title, children, className }: MinecraftTooltipProps): JSX.Element {
  return (
    <div className={classNames(classes.tooltip, className)}>
      <div className={classes.title}>{title}</div>
      <div className={classes.content}>{children}</div>
    </div>
  );
}

export default MinecraftTooltip;
