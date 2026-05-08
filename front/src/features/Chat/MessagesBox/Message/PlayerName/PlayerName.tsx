import { Server } from '@surtom/interfaces';
import { getPlayerColor } from '../../../utils/messageFormatting';

const PlayerName = ({ name, moderatorLevel }: Pick<Server.User, 'name' | 'moderatorLevel'>) => (
  <span
    style={{
      color: getPlayerColor(moderatorLevel, name),
    }}
  >
    {name}
  </span>
);

export default PlayerName;
