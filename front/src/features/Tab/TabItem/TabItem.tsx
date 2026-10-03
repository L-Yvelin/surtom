import { JSX } from 'react';
import { useTranslation } from 'react-i18next';
import { PlayerListChatButton, PlayerListRow } from '@surtom/design-system';
import { Server } from '@surtom/interfaces';
import { getPlayerColor, rank } from '../../Chat/utils/messageFormatting';
import { startPrivateMessage } from '../../Chat/utils/privateMessage';
import usePlayerStore from '../../../stores/usePlayerStore';
import phoneIcon from '../../../assets/images/tools/phone.png';
import computerIcon from '../../../assets/images/tools/computer.png';

interface TabItemProps {
  user?: Server.User;
}

function TabItem({ user }: TabItemProps): JSX.Element {
  const { t } = useTranslation();
  const selfName = usePlayerStore((s) => s.player.name);
  if (!user) return <PlayerListRow />;

  const hasRank = Object.keys(rank).includes(`${user.moderatorLevel}`);

  return (
    <PlayerListRow
      name={user.name}
      nameColor={getPlayerColor(user.moderatorLevel, user.name)}
      icon={<img src={user.isMobile ? phoneIcon : computerIcon} alt={t('tab.deviceAlt')} />}
      suffix={hasRank ? `[${rank[user.moderatorLevel as keyof typeof rank] ?? '?'}]` : undefined}
      actions={
        user.name !== selfName && (
          <PlayerListChatButton label={t('tab.messageAlt', { name: user.name })} onClick={() => startPrivateMessage(user.name)} />
        )
      }
      ping={5}
      pingAlt={t('tab.connectivityAlt')}
    />
  );
}

export default TabItem;
