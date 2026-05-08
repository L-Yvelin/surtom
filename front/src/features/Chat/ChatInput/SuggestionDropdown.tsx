import { JSX } from 'react';
import classes from './SuggestionDropdown.module.css';
import { ActiveSuggestion, Suggestion } from './useInputSuggestions';

interface SuggestionDropdownProps {
  active: ActiveSuggestion;
  onSelect: (suggestion: Suggestion) => void;
  selectedIndex: number;
}

function SuggestionDropdown({ active, onSelect, selectedIndex }: SuggestionDropdownProps): JSX.Element {
  return (
    <div className={classes.dropdown}>
      {active.suggestions.map((suggestion, i) => (
        <div
          key={suggestion.value + i}
          className={`${classes.item} ${i === selectedIndex ? classes.selected : ''}`}
          onMouseDown={(e) => {
            e.preventDefault();
            onSelect(suggestion);
          }}
        >
          {suggestion.label}
        </div>
      ))}
    </div>
  );
}

export default SuggestionDropdown;
