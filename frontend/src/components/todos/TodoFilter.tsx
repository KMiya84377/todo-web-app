import React from 'react';
import { Box, ToggleButtonGroup, ToggleButton } from '@mui/material';

interface TodoFilterProps {
  filter: string;
  onFilterChange: (filter: string) => void;
}

const TodoFilter: React.FC<TodoFilterProps> = ({ filter, onFilterChange }) => {
  const handleFilterChange = (
    _event: React.MouseEvent<HTMLElement>,
    newFilter: string | null
  ) => {
    if (newFilter !== null) {
      onFilterChange(newFilter);
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
      <ToggleButtonGroup
        value={filter}
        exclusive
        onChange={handleFilterChange}
        aria-label="Todo filter"
        size="small"
        color="primary"
      >
        <ToggleButton value="all" aria-label="all todos">
          All
        </ToggleButton>
        <ToggleButton value="active" aria-label="active todos">
          Active
        </ToggleButton>
        <ToggleButton value="completed" aria-label="completed todos">
          Completed
        </ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
};

export default TodoFilter;