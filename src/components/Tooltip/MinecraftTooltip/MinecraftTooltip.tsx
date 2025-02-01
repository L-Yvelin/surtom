import { JSX } from "react";
import classes from "./MinecraftTooltip.module.css";

interface MinecraftTooltipProps {
  title: string;
  content: string;
}

function MinecraftTooltip({
  title,
  content,
}: MinecraftTooltipProps): JSX.Element {
  return (
    <div className={classes.tooltip}>
      <div className={classes.title}>{title}</div>
      <div className={classes.content}>{content}</div>
    </div>
  );
}

export default MinecraftTooltip;
