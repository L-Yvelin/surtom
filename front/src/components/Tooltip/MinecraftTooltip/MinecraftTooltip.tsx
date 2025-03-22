import { JSX } from "react";
import classes from "./MinecraftTooltip.module.css";

interface MinecraftTooltipProps {
  title: string;
  children: string | JSX.Element;
}

function MinecraftTooltip({
  title,
  children,
}: MinecraftTooltipProps): JSX.Element {
  return (
    <div className={classes.tooltip}>
      <div className={classes.title}>{title}</div>
      <div className={classes.content}>{children}</div>
    </div>
  );
}

export default MinecraftTooltip;
