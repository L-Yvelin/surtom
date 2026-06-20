import { JSX, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import classes from './ResourcePacks.module.css';
import Button from '../Button/Button';
import Screen from '../Screen/Screen';
import useUIStore from '../../stores/useUIStore';
import { useResourcePackStore, type ResourcePack } from '../../stores/useResourcePackStore';
import { TEXTURES } from '../../mc/textures';

import { UI } from '../ids';

const DEFAULT_ICON = TEXTURES['block/grass_block_side.png'].default;

interface PackEntryProps {
  icon: string | null;
  name: string;
  description: string;
  onActivate?: () => void;
  controls?: JSX.Element;
}

function PackEntry({ icon, name, description, onActivate, controls }: PackEntryProps): JSX.Element {
  return (
    <div
      className={classNames(classes.entry, { [classes.clickable]: !!onActivate })}
      onClick={onActivate}
      role={onActivate ? 'button' : undefined}
    >
      <div className={classes.entryIcon} style={{ backgroundImage: icon ? `url(${icon})` : undefined }} />
      <div className={classes.entryText}>
        <div className={classes.entryName}>{name}</div>
        <div className={classes.entryDescription}>{description}</div>
      </div>
      {controls && (
        <div className={classes.entryControls} onClick={(e) => e.stopPropagation()}>
          {controls}
        </div>
      )}
    </div>
  );
}

function ResourcePacks(): JSX.Element {
  const { t } = useTranslation();
  const setVisibility = useUIStore((s) => s.setVisibility);
  const close = (): void => setVisibility(UI.RESOURCE_PACKS, false);

  const packs = useResourcePackStore((s) => s.packs);
  const selectedIds = useResourcePackStore((s) => s.selectedIds);
  const addFromFile = useResourcePackStore((s) => s.addFromFile);
  const remove = useResourcePackStore((s) => s.remove);
  const toggleSelected = useResourcePackStore((s) => s.toggleSelected);
  const moveSelected = useResourcePackStore((s) => s.moveSelected);

  const [search, setSearch] = useState('');
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const importFiles = (files: FileList | null): void => {
    if (!files) return;
    for (const file of Array.from(files)) {
      if (!file.name.toLowerCase().endsWith('.zip')) continue;
      void addFromFile(file).catch(console.error);
    }
  };

  const byId = (id: string): ResourcePack | undefined => packs.find((p) => p.id === id);
  const matchesSearch = (pack: ResourcePack): boolean => pack.name.toLowerCase().includes(search.toLowerCase());

  const available = packs.filter((p) => !selectedIds.includes(p.id) && matchesSearch(p));
  const selected = selectedIds.map(byId).filter((p): p is ResourcePack => !!p);

  return (
    <Screen id={UI.RESOURCE_PACKS}>
      <div className={classes.title}>{t('resourcePacks.title')}</div>
      <div className={classes.dropHint}>{t('resourcePacks.dropHint')}</div>

      <input
        className={classes.search}
        placeholder={t('resourcePacks.search')}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        type="text"
      />

      <div
        className={classNames(classes.columns, { [classes.dragging]: dragging })}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          importFiles(e.dataTransfer.files);
        }}
      >
        <div className={classes.column}>
          <div className={classes.columnTitle}>{t('resourcePacks.available')}</div>
          <div className={classes.list}>
            {available.map((pack) => (
              <PackEntry
                key={pack.id}
                icon={pack.iconUrl}
                name={pack.name}
                description={pack.description}
                onActivate={() => toggleSelected(pack.id)}
                controls={
                  !pack.builtin ? (
                    <button
                      className={classes.controlButton}
                      title={t('resourcePacks.remove')}
                      onClick={() => void remove(pack.id).catch(console.error)}
                    >
                      🗑
                    </button>
                  ) : undefined
                }
              />
            ))}
            {available.length === 0 && <div className={classes.empty}>{t('resourcePacks.empty')}</div>}
          </div>
        </div>

        <div className={classes.column}>
          <div className={classes.columnTitle}>{t('resourcePacks.selected')}</div>
          <div className={classes.list}>
            {selected.map((pack, index) => (
              <PackEntry
                key={pack.id}
                icon={pack.iconUrl}
                name={pack.name}
                description={pack.description}
                onActivate={() => toggleSelected(pack.id)}
                controls={
                  <>
                    <button
                      className={classes.controlButton}
                      title={t('resourcePacks.moveUp')}
                      disabled={index === 0}
                      onClick={() => moveSelected(pack.id, -1)}
                    >
                      ▲
                    </button>
                    <button
                      className={classes.controlButton}
                      title={t('resourcePacks.moveDown')}
                      disabled={index === selected.length - 1}
                      onClick={() => moveSelected(pack.id, 1)}
                    >
                      ▼
                    </button>
                  </>
                }
              />
            ))}
            <PackEntry icon={DEFAULT_ICON} name={t('resourcePacks.default')} description={t('resourcePacks.defaultDescription')} />
          </div>
        </div>
      </div>

      <input ref={fileInputRef} type="file" accept=".zip" multiple hidden onChange={(e) => importFiles(e.target.files)} />

      <div className={classes.actions}>
        <Button text={t('resourcePacks.addPack')} onClick={() => fileInputRef.current?.click()} className={classes.action} />
        <Button text={t('resourcePacks.done')} onClick={close} className={classes.action} />
      </div>
    </Screen>
  );
}

export default ResourcePacks;
