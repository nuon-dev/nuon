import { useState, useEffect, useMemo } from "react"
import {
  TextField,
  Autocomplete,
  Box,
  Typography,
  CircularProgress,
} from "@mui/material"
import { get } from "@/config/api"
import { type User } from "@server/entity/user"
import { debounce } from "lodash"

interface UserSearchProps {
  onSelectUser: (user: User) => void
}

export default function UserSearch({ onSelectUser }: UserSearchProps) {
  const [open, setOpen] = useState(false)
  const [options, setOptions] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [inputValue, setInputValue] = useState("")

  const fetchUsers = useMemo(
    () =>
      debounce(
        async (
          request: { input: string },
          callback: (results?: User[]) => void,
        ) => {
          try {
            const results = await get(
              `/admin/community/search-user?name=${request.input}`,
            )
            callback(results)
          } catch (error) {
            console.error(error)
            callback([])
          }
        },
        300,
      ),
    [],
  )

  useEffect(() => {
    let active = true

    if (inputValue === "") {
      setOptions([])
      return undefined
    }

    setLoading(true)
    fetchUsers({ input: inputValue }, (results) => {
      if (active && results) {
        setOptions(results)
      }
      setLoading(false)
    })

    return () => {
      active = false
    }
  }, [inputValue, fetchUsers])

  return (
    <Autocomplete
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      isOptionEqualToValue={(option, value) => option.id === value.id}
      getOptionLabel={(option) => `${option.name} (${option.yearOfBirth})`}
      options={options}
      loading={loading}
      onInputChange={(event, newInputValue) => {
        setInputValue(newInputValue)
      }}
      onChange={(event, newValue) => {
        if (newValue) {
          onSelectUser(newValue)
          setOpen(false)
        }
      }}
      renderOption={(props, option) => {
        const { key, ...optionProps } = props
        return (
          <li key={key} {...optionProps}>
            <Box>
              <Typography variant="body2">
                {option.name} ({option.yearOfBirth})
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {option.community ? option.community.name : "미배정"}
              </Typography>
            </Box>
          </li>
        )
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label="사용자 검색"
          size="small"
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? (
                  <CircularProgress color="inherit" size={20} />
                ) : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      sx={{ width: 300 }}
    />
  )
}
