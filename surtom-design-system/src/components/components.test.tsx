import { renderToStaticMarkup } from 'react-dom/server';
import { AchievementToast } from './AchievementToast/AchievementToast';
import { BeaconKey } from './BeaconKey/BeaconKey';
import { BlockBar } from './BlockBar/BlockBar';
import { BlockTile } from './BlockTile/BlockTile';
import { Button } from './Button/Button';
import { ButtonRow } from './ButtonRow/ButtonRow';
import { Chest } from './Chest/Chest';
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
