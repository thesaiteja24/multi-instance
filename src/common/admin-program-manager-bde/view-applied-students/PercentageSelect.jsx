import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

function getStyles(percentage, selectedPercentage, theme) {
  return {
    fontWeight:
      selectedPercentage === percentage.toString()
        ? theme.typography.fontWeightMedium
        : theme.typography.fontWeightRegular,
  };
}

export default function PercentageSelect({ selectedPercentage, handleChange }) {
  const theme = useTheme();
  const percentages = [...Array(10)].map((_, index) => 50 + index * 5);

  return (
    <div>
      <FormControl sx={{ m: 1, width: 300 }}>
        <InputLabel id="demo-percentage-label">
          <span style={{ fontWeight: 'bold' }}>Percentage</span>
        </InputLabel>
        <Select
          labelId="demo-percentage-label"
          id="demo-percentage"
          value={selectedPercentage || ''}
          onChange={handleChange}
          input={<OutlinedInput label="Percentage" />}
          MenuProps={MenuProps}
        >
          <MenuItem value="" style={getStyles('', selectedPercentage, theme)}>
            Minimum Percentage
          </MenuItem>
          {percentages.map(percentage => (
            <MenuItem
              key={percentage}
              className="menu-item"
              value={percentage.toString()}
              style={getStyles(percentage, selectedPercentage, theme)}
            >
              {percentage}%
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
}
