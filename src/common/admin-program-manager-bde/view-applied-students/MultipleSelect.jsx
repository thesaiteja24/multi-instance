import * as React from 'react';
import { useTheme } from '@mui/material/styles';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
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

const departments = [
  'CSE',
  'CIS',
  'IT',
  'ECE',
  'EEE',
  'CIVIL',
  'MECH',
  'AIML',
  'AIDS',
  'CSD',
  'MBA',
  'MTECH CSE',
  'IoT',
  'BBA',
  'BCA',
  'BSC',
  'MCA',
  'MSC',
  'MCA',
  'Others',
];

function getStyles(department, selectedDepartments, theme) {
  return {
    fontWeight:
      selectedDepartments.indexOf(department) === -1
        ? theme.typography.fontWeightRegular
        : theme.typography.fontWeightMedium,
  };
}

export default function MultipleSelect({
  selectedDepartments,
  handleChange,
  setCustomDepartments,
  customDepartments,
}) {
  const theme = useTheme();
  const [showCustomInput, setShowCustomInput] = React.useState(false);
  const [customDeptInput, setCustomDeptInput] = React.useState('');

  const handleLocalChange = event => {
    const value = event.target.value;
    setShowCustomInput(value.includes('Others'));
    if (!value.includes('Others')) {
      setCustomDeptInput('');
      setCustomDepartments([]);
    }
    handleChange(event);
  };

  const handleCustomDeptChange = event => {
    setCustomDeptInput(event.target.value);
  };

  const addCustomDepartment = () => {
    if (
      customDeptInput.trim() &&
      !customDepartments.includes(customDeptInput.trim())
    ) {
      const updatedDept =
        customDeptInput.charAt(0).toUpperCase() +
        customDeptInput.slice(1).trim();
      setCustomDepartments([...customDepartments, updatedDept]);
      setCustomDeptInput('');
    }
  };

  const removeCustomDepartment = dept => {
    setCustomDepartments(customDepartments.filter(d => d !== dept));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <FormControl sx={{ m: 1, width: 300 }}>
        <InputLabel id="demo-multiple-department-label">
          <span style={{ fontWeight: 'bold' }}>Departments</span>
        </InputLabel>
        <Select
          labelId="demo-multiple-department-label"
          id="demo-multiple-department"
          multiple
          value={selectedDepartments}
          onChange={handleLocalChange}
          input={<OutlinedInput label="Departments" />}
          MenuProps={MenuProps}
        >
          {departments.map(department => (
            <MenuItem
              className="menu-item"
              key={department}
              value={department}
              style={getStyles(department, selectedDepartments, theme)}
            >
              {department}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      {showCustomInput && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            width: 300,
            marginLeft: '8px',
          }}
        >
          <TextField
            label="Custom Department"
            value={customDeptInput}
            onChange={handleCustomDeptChange}
            variant="outlined"
          />
          <Button
            variant="contained"
            onClick={addCustomDepartment}
            disabled={!customDeptInput.trim()}
            sx={{ alignSelf: 'flex-start' }}
          >
            Add Custom Department
          </Button>
          <div
            className="selected-skills"
            style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}
          >
            {customDepartments.map((dept, index) => (
              <p
                key={index}
                style={{
                  color: 'black',
                  background: '#e0e0e0',
                  padding: '5px 10px',
                  borderRadius: '15px',
                  display: 'flex',
                  alignItems: 'center',
                  margin: 0,
                }}
              >
                {dept}
                <button
                  type="button"
                  className="remove-skill"
                  onClick={() => removeCustomDepartment(dept)}
                  style={{
                    marginLeft: '5px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'red',
                  }}
                >
                  X
                </button>
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
