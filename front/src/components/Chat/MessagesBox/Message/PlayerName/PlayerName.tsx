import { Server } from "../../../../../utils/Message";
import { getPlayerColor } from "../../../utils";

const PlayerName = ({
  name,
  moderatorLevel,
}: Pick<Server.User, "name" | "moderatorLevel">) => (
  <span
    style={{
      color: getPlayerColor(moderatorLevel, name),
    }}
  >
    {name}
  </span>
);

export default PlayerName;