import { Box, Button, MenuItem, Stack, TextField } from "@mui/material"

interface NewcomerFilterProps {
  filterName: string
  setFilterName: (value: string) => void
  filterGender: "" | "man" | "woman"
  setFilterGender: (value: "" | "man" | "woman") => void
  filterMinYear: string
  setFilterMinYear: (value: string) => void
  filterMaxYear: string
  setFilterMaxYear: (value: string) => void
  clearFilters: () => void
}

export default function NewcomerFilter({
  filterName,
  setFilterName,
  filterGender,
  setFilterGender,
  filterMinYear,
  setFilterMinYear,
  filterMaxYear,
  setFilterMaxYear,
  clearFilters,
}: NewcomerFilterProps) {
  return (
    <Stack
      p="16px"
      m="12px"
      border="1px solid #e0e0e0"
      borderRadius="12px"
      bgcolor="#fafafa"
      boxShadow="0 2px 4px rgba(0,0,0,0.1)"
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        mb="16px"
      >
        <Box fontWeight="bold" fontSize="16px" color="#333">
          필터
        </Box>
        <Button
          size="small"
          onClick={clearFilters}
          variant="outlined"
          sx={{
            borderRadius: "8px",
            textTransform: "none",
            fontSize: "12px",
          }}
        >
          초기화
        </Button>
      </Stack>

      <Stack gap="12px">
        <Stack direction="row" alignItems="center" gap="12px">
          <Box width="60px" fontSize="14px">
            이름:
          </Box>
          <TextField
            size="small"
            placeholder="이름 검색"
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
            variant="outlined"
            sx={{ flex: 1 }}
          />
        </Stack>

        <Stack direction="row" alignItems="center" gap="12px">
          <Box width="60px" fontSize="14px">
            성별:
          </Box>
          <TextField
            select
            size="small"
            value={filterGender}
            onChange={(e) =>
              setFilterGender(e.target.value as "" | "man" | "woman")
            }
            variant="outlined"
            sx={{ flex: 1 }}
          >
            <MenuItem value="">전체</MenuItem>
            <MenuItem value="man">남</MenuItem>
            <MenuItem value="woman">여</MenuItem>
          </TextField>
        </Stack>

        <Stack direction="row" alignItems="center" gap="12px">
          <Box width="60px" fontSize="14px">
            생년:
          </Box>
          <TextField
            size="small"
            placeholder="최소"
            value={filterMinYear}
            onChange={(e) => setFilterMinYear(e.target.value)}
            variant="outlined"
            type="number"
            sx={{ width: "90px" }}
          />
          <Box fontSize="12px" color="gray">
            ~
          </Box>
          <TextField
            size="small"
            placeholder="최대"
            value={filterMaxYear}
            onChange={(e) => setFilterMaxYear(e.target.value)}
            variant="outlined"
            type="number"
            sx={{ width: "90px" }}
          />
        </Stack>
      </Stack>
    </Stack>
  )
}
