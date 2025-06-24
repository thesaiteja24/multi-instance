import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import './ViewAppliedStudents.css';

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

function getStyles(skill, selectedSkills, theme) {
  return {
    fontWeight:
      selectedSkills.indexOf(skill) === -1
        ? theme.typography.fontWeightRegular
        : theme.typography.fontWeightMedium,
  };
}

export default function SkillsSelect({
  jobSkills,
  selectedSkills,
  handleChange,
}) {
  const theme = useTheme();

  return (
    <div>
      <FormControl sx={{ m: 1, width: 300 }}>
        <InputLabel id="demo-multiple-skill-label">
          <span style={{ fontWeight: 'bold !important' }}>Skills</span>
        </InputLabel>
        <Select
          labelId="demo-multiple-skill-label"
          id="demo-multiple-skill"
          multiple
          value={selectedSkills}
          onChange={handleChange}
          input={<OutlinedInput label="Skills" />}
          MenuProps={MenuProps}
        >
          {jobSkills.map(skill => (
            <MenuItem
              key={skill}
              className="menu-item"
              value={skill}
              style={getStyles(skill, selectedSkills, theme)}
            >
              {skill}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
}
