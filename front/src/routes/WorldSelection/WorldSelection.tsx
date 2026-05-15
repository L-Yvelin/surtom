import { JSX, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Server } from '@surtom/interfaces';
import classes from './WorldSelection.module.css';
import Button from '../../ui/Button/Button';
import WorldEntry, { World } from './WorldEntry/WorldEntry';
import { useFetchWorlds } from '../../hooks/useFetchWorlds';
import { useWorldsStore } from '../../stores/useWorldsStore';

function buildDescription(t: (key: string, opts?: object) => string, summary: Server.WorldSummary): string {
  return `${t('worldSelection.memberCount', { count: summary.memberCount })} · ${summary.language.toUpperCase()}`;
}

function WorldSelection(): JSX.Element {
  const navigate = useNavigate();
  const { t } = useTranslation();
  useFetchWorlds();

  const worlds = useWorldsStore((s) => s.worlds);
  const isFetching = useWorldsStore((s) => s.isFetching);

  const uiWorlds: World[] = [...(worlds ?? [])]
    .sort((a, b) => b.id.localeCompare(a.id))
    .map((summary) => ({
      id: summary.id,
      name: summary.displayName,
      persistent: summary.persistent,
      description: buildDescription(t, summary),
    }));

  const [selectedId, setSelectedId] = useState<string>('');
  const [search, setSearch] = useState('');

  const filtered = uiWorlds.filter((w) => w.name.toLowerCase().includes(search.toLowerCase()));
  const effectiveSelectedId = selectedId || filtered[0]?.id || '';
  const selected = filtered.find((w) => w.id === effectiveSelectedId) ?? filtered[0];

  const isLoading = worlds === null || isFetching;

  return (
    <div className={classes.screen}>
      <h1 className={classes.title}>{t('worldSelection.title')}</h1>

      <input
        className={classes.search}
        placeholder={t('worldSelection.search')}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        type="text"
        disabled={isLoading}
      />

      <div className={classes.list}>
        {isLoading && <div className={classes.empty}>{t('worldSelection.loading')}</div>}
        {!isLoading &&
          filtered.map((w) => (
            <WorldEntry
              key={w.id}
              world={w}
              selected={w.id === effectiveSelectedId}
              onSelect={() => setSelectedId(w.id)}
              onDoubleClick={() => navigate(`/quotidien/${w.id}`)}
            />
          ))}
        {!isLoading && filtered.length === 0 && <div className={classes.empty}>{t('worldSelection.empty')}</div>}
      </div>

      <div className={classes.actions}>
        <div className={classes.actionRow}>
          <Button
            text={t('worldSelection.play')}
            onClick={() => selected && navigate(`/quotidien/${selected.id}`)}
            disabled={!selected || isLoading}
            className={classes.action}
          />
          <Button text={t('worldSelection.edit')} disabled className={classes.action} />
        </div>
        <div className={classes.actionRow}>
          <Button text={t('worldSelection.delete')} disabled className={classes.action} />
          <Button text={t('worldSelection.recreate')} disabled className={classes.action} />
        </div>
        <div className={classes.actionRow}>
          <Button text={t('worldSelection.newWorld')} disabled className={classes.action} />
          <Button text={t('worldSelection.cancel')} onClick={() => navigate('/')} className={classes.action} />
        </div>
      </div>
    </div>
  );
}

export default WorldSelection;
