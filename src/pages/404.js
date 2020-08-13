import React from 'react'
import { Grid, Typography } from '@material-ui/core'

const Page = () => {
  return (
    <Grid xs={12}>
      <Typography variant='h3' align='center' style={{ marginTop: 30 }}>
        Not Found
      </Typography>
      <a href='/'>
        <Typography align='center'>Go home</Typography>
      </a>
    </Grid>
  )
}

export default Page
