import { renderToStaticMarkup } from 'react-dom/server';
import { AchievementToast } from './AchievementToast/AchievementToast';
import { BeaconKey } from './BeaconKey/BeaconKey';
import { BlockBar } from './BlockBar/BlockBar';
import { BlockTile } from './BlockTile/BlockTile';
import { Button } from './Button/Button';
import { ButtonRow } from './ButtonRow/ButtonRow';
import { Chest } from './Chest/Chest';
import { PlayerList } from './PlayerList/PlayerList';
import { PlayerListChatButton } from './PlayerList/PlayerListChatButton';
import { PlayerListRow } from './PlayerList/PlayerListRow';
import { Screen } from './Screen/Screen';

describe('BlockTile', () => {
  it('applies the material class and merges the custom class name', () => {
    const html = renderToStaticMarkup(
      <BlockTile material="gold" className="custom">
        a
      </BlockTile>,
    );
    expect(html).toContain('class="tile gold custom"');
  });

  it('renders without a material', () => {
    expect(renderToStaticMarkup(<BlockTile>a</BlockTile>)).toContain('class="tile"');
  });
});

describe('BeaconKey', () => {
  it('maps the variant and pressed state to classes and forwards button props', () => {
    const html = renderToStaticMarkup(
      <BeaconKey variant="diamond" pressed className="wide" data-testid="key">
        q
      </BeaconKey>,
    );
    expect(html).toContain('key diamond pressed wide');
    expect(html).toContain('data-testid="key"');
  });

  it('adds no variant class by default', () => {
    expect(renderToStaticMarkup(<BeaconKey>q</BeaconKey>)).toContain('class="key"');
  });
});

describe('BlockBar', () => {
  it('exposes the height, the badge and the revealed state', () => {
    const html = renderToStaticMarkup(<BlockBar material="gold" heightPercent={42} revealed label={2} badge={3} />);
    expect(html).toContain('bar gold revealed');
    expect(html).toContain('data-badge="3"');
    expect(html).toContain('--height:42%');
  });

  it('hides the badge when the value is zero', () => {
    const html = renderToStaticMarkup(<BlockBar heightPercent={0} revealed={false} badge={0} />);
    expect(html).not.toContain('data-badge');
    expect(html).toContain('bar dirt');
    expect(html).not.toContain('revealed');
  });
});

describe('Button', () => {
  it('renders the text and the disabled class', () => {
    const html = renderToStaticMarkup(<Button text="Play" disabled shouldMarquee={false} />);
    expect(html).toContain('Play');
    expect(html).toContain('disabled');
  });
});

describe('Screen', () => {
  it('is hidden when not visible', () => {
    expect(renderToStaticMarkup(<Screen visible={false}>x</Screen>)).toContain('hidden');
    expect(renderToStaticMarkup(<Screen>x</Screen>)).not.toContain('hidden');
  });
});

describe('AchievementToast', () => {
  it('renders the title, the description and the icon', () => {
    const html = renderToStaticMarkup(<AchievementToast title="T" description="D" icon="icon.png" iconAlt="alt" />);
    expect(html).toContain('>T<');
    expect(html).toContain('>D<');
    expect(html).toContain('src="icon.png"');
    expect(html).toContain('alt="alt"');
  });
});

describe('ButtonRow', () => {
  it('renders its children', () => {
    expect(renderToStaticMarkup(<ButtonRow>child</ButtonRow>)).toContain('child');
  });
});

describe('Chest', () => {
  it('renders rows times cols slots', () => {
    const html = renderToStaticMarkup(<Chest title="Chest" slots={[]} rows={2} cols={3} />);
    expect(html.match(/class="slot"/g)).toHaveLength(6);
  });
});

describe('PlayerList', () => {
  it('renders its rows and merges the custom class name', () => {
    const html = renderToStaticMarkup(
      <PlayerList className="custom">
        <PlayerListRow name="Alex" />
      </PlayerList>,
    );
    expect(html).toContain('class="list custom"');
    expect(html).toContain('Alex');
  });
});

describe('PlayerListRow', () => {
  it('renders an empty cell when there is no name', () => {
    expect(renderToStaticMarkup(<PlayerListRow />)).toBe('<div class="row"></div>');
  });

  it('renders the name colour, the suffix and the ping icon', () => {
    const html = renderToStaticMarkup(<PlayerListRow name="Alex" nameColor="red" suffix="[Admin]" ping={5} pingAlt="Ping" />);
    expect(html).toContain('style="color:red"');
    expect(html).toContain('[Admin]');
    expect(html).toContain('alt="Ping"');
  });

  it('omits the ping icon and the suffix when not given', () => {
    const html = renderToStaticMarkup(<PlayerListRow name="Alex" />);
    expect(html).not.toContain('<img');
    expect(html).not.toContain('suffix');
  });
});

describe('PlayerList minRows', () => {
  it('pads a short list with empty cells up to the minimum height', () => {
    const html = renderToStaticMarkup(
      <PlayerList minRows={5}>
        <PlayerListRow name="Alex" />
        <PlayerListRow name="Steve" />
      </PlayerList>,
    );
    expect(html.match(/<div class="row"><\/div>/g)).toHaveLength(3);
  });

  it('does not add cells to a list that is already taller than the minimum', () => {
    const rows = Array.from({ length: 8 }, (_, index) => <PlayerListRow key={index} name={`p${index}`} />);
    const html = renderToStaticMarkup(<PlayerList minRows={5}>{rows}</PlayerList>);
    expect(html.match(/class="row"/g)).toHaveLength(8);
    expect(html.match(/<div class="row"><\/div>/g)).toBeNull();
  });
});

describe('PlayerListChatButton', () => {
  it('renders an accessible button that forwards button props', () => {
    const html = renderToStaticMarkup(<PlayerListChatButton label="Message" disabled />);
    expect(html).toContain('<button type="button"');
    expect(html).toContain('aria-label="Message"');
    expect(html).toContain('disabled=""');
  });

  it('is rendered inside the row before the ping icon', () => {
    const html = renderToStaticMarkup(
      <PlayerListRow name="Alex" ping={5} pingAlt="Ping" actions={<PlayerListChatButton label="Message" />} />,
    );
    expect(html.indexOf('aria-label="Message"')).toBeGreaterThan(-1);
    expect(html.indexOf('aria-label="Message"')).toBeLessThan(html.indexOf('alt="Ping"'));
  });
});
