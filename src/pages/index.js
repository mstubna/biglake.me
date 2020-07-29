import 'typeface-montserrat'
import React, { useState, useEffect, useRef } from 'react'
import { Helmet } from 'react-helmet'
import {
  Button,
  CircularProgress,
  CssBaseline,
  Grid,
  Slide,
  TextField,
  Typography,
} from '@material-ui/core'
import {
  createMuiTheme,
  makeStyles,
  responsiveFontSizes,
  ThemeProvider,
} from '@material-ui/core/styles'
import capitalize from 'lodash/capitalize'
import { findBestMatchForName, getGeo } from '../utilities'
import icon3 from '../images/icon3.png'
import '../index.css'
import '../../node_modules/leaflet/dist/leaflet.css'
import leaflet from '../../node_modules/leaflet/dist/leaflet.js'
const {
  Map: LeafletMap,
  TileLayer,
  GeoJSON,
  ZoomControl,
} = require('react-leaflet')

const hFonts = {
  fontFamily: "'Eclat', 'Times New Roman', Times, serif",
}
let theme = createMuiTheme({
  typography: {
    fontSize: 14,
    fontFamily: "'Montserrat', 'Helvetica', 'Arial', sans-serif",
    useNextVariants: true,
    h1: hFonts,
    h2: hFonts,
    h3: hFonts,
    h4: hFonts,
    h5: hFonts,
    h6: hFonts,
    subtitle1: hFonts,
  },
  palette: {
    background: { default: '#3566ab' },
    primary: { main: '#fbc02d' },
    secondary: { main: '#fff' },
    text: {
      primary: '#fff',
      secondary: '#fff',
    },
    action: {
      disabledBackground: '#fbc02dd1',
    },
  },
  shape: {
    borderRadius: 30,
  },
  shadows: ['none'],
  overrides: {
    MuiOutlinedInput: {
      root: {
        '& $notchedOutline': {
          borderColor: '#fff',
        },
      },
    },
  },
})

theme = responsiveFontSizes(theme)

const useStyles = makeStyles({
  headerContainer: {
    marginTop: 20,
  },
  titleContainer: {},
  title: {
    marginBottom: -10,
  },
  titleFont: {
    fontWeight: 400,
  },
  titleFontLink: {
    textDecoration: 'none',
    color: 'white',
  },
  subtitleContainer: {
    marginTop: 10,
  },
  subtitleFont: {
    color: theme.palette.text.primary,
  },
  inputContainer: {},
  inputLabel: {
    textAlign: 'center',
    marginBottom: 10,
  },
  textInput: {},
  sliderMark: {
    fontSize: 14,
    [theme.breakpoints.up('sm')]: {
      fontSize: 20,
    },
    [theme.breakpoints.up('md')]: {
      fontSize: 24,
    },
  },
  transitionContainer: {
    minHeight: 240,
  },
  slideContainer: {
    paddingTop: 40,
    paddingBottom: 40,
  },
  nameContainer: {
    display: 'flex',
    justifyContent: 'center',
  },
  nameFont: {
    textAlign: 'center',
  },
  mapContainer: {
    marginTop: 20,
    display: 'flex',
    justifyContent: 'center',
  },
  mapLabel: {
    textAlign: 'center',
    marginTop: 20,
  },
  map: {
    height: 400,
    width: '100%',
  },
  buttonGroup: {
    marginTop: 20,
    marginBottom: 20,
  },
  backButton: {
    padding: 4,
    marginLeft: 14,
    marginRight: 14,
    marginBottom: 8,
    width: 120,
  },
  nextButton: {
    padding: 4,
    marginLeft: 14,
    marginRight: 14,
    marginBottom: 8,
    width: 180,
  },
  linkGroup: {
    marginTop: 60,
  },
  linkFont: {
    fontSize: 10,
    [theme.breakpoints.up('sm')]: {
      fontSize: 12,
    },
  },
  link: {
    textDecoration: 'underline',
    color: theme.palette.text.secondary,
  },
})

// hook for tracking the previous value of a stateful variable
const usePrevious = (value) => {
  const ref = useRef()
  useEffect(() => {
    ref.current = value
  })
  return ref.current
}

const IndexPage = () => {
  const classes = useStyles()
  const [step, setStep] = useState(0)
  const prevStep = usePrevious(step)
  const [name, setName] = useState('')
  const [descriptor, setDescriptor] = useState('')
  const [bigLakeName, setBigLakeName] = useState('')
  const [geo, setGeo] = useState()
  const [loading, setLoading] = useState(false)

  const handleNameChange = (e) => {
    setName(e.target.value)
  }

  const handleDescriptorChange = (e) => {
    setDescriptor(e.target.value)
  }

  const handleBack = () => {
    if (step === 0) {
      return
    }
    setStep(step - 1)
  }

  const handleNext = async () => {
    if (step === 1) {
      handleBigLakeify(name)
    }
    if (step === 2) {
      return handleReset()
    }
    setStep(step + 1)
  }

  const handleReset = () => {
    setStep(0)
    setName('')
    setDescriptor('')
    setBigLakeName('')
    setGeo(null)
    setLoading(false)
  }

  const handleBigLakeify = (name) => {
    setLoading(true)
    const match = findBestMatchForName(name)
    setBigLakeName(`${capitalize(descriptor)} ${match.name}`)
    loadGeo(match.id)
  }

  const loadGeo = async (id) => {
    try {
      const {
        data: {
          object: { geometry },
        },
      } = await getGeo(id)
      console.log('loaded geometry', geometry)
      setGeo(geometry)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const directionForStepIndex = (stepIndex) => {
    return (step === stepIndex && prevStep === stepIndex - 1) ||
      prevStep === undefined ||
      (step === stepIndex - 1 && prevStep === stepIndex)
      ? 'left'
      : 'right'
  }

  const getGeoProps = () => {
    if (!geo) {
      return {}
    }
    const bounds = leaflet.geoJSON(geo).getBounds().pad(0.5)
    return {
      center: bounds.getCenter(),
      bounds: [
        [bounds.getNorthEast().lat, bounds.getNorthEast().lng],
        [bounds.getSouthWest().lat, bounds.getSouthWest().lng],
      ],
    }
  }

  return (
    <ThemeProvider theme={theme}>
      <Helmet>
        <title>BigLake.me</title>
        <meta property='og:title' content='BigLake.me' />
        <meta property='og:description' content='Big Lake name generator' />
        <meta property='og:image' content={icon3} />
        <meta property='og:url' content='https://biglake.me' />
        <meta name='twitter:title' content='BigLake.me' />
        <meta name='twitter:description' content='Big Lake name generator' />
        <meta name='twitter:image' content={icon3} />
        <meta name='twitter:card' content={icon3} />
      </Helmet>
      <CssBaseline />
      <div style={{ overflow: 'hidden' }}>
        <Grid
          className={classes.headerContainer}
          container
          direction='column'
          justify='center'
          alignItems='center'
        >
          <Grid className={classes.titleContainer}>
            <Grid
              className={classes.title}
              container
              direction='row'
              alignItems='center'
            >
              <Typography
                className={classes.titleFont}
                variant='h2'
                align='center'
              >
                <a href='/' className={classes.titleFontLink}>
                  BigLake.me
                </a>
              </Typography>
            </Grid>
          </Grid>
          <Grid className={classes.subtitleContainer}>
            <Typography className={classes.subtitleFont} variant='body1'>
              Big Lake-ify me!
            </Typography>
          </Grid>
        </Grid>
        <Grid
          className={classes.transitionContainer}
          item
          container
          direction='row'
          justify='center'
          alignItems='center'
          xs={12}
        >
          <Slide
            className={classes.slideContainer}
            direction={directionForStepIndex(0)}
            in={step === 0}
            mountOnEnter
            unmountOnExit
            exit={false}
          >
            <Grid
              className={classes.inputContainer}
              item
              xs={10}
              sm={8}
              md={6}
              lg={5}
            >
              <Typography
                className={classes.inputLabel}
                variant='body2'
                color='textSecondary'
              >
                What's your name?
              </Typography>
              <TextField
                className={classes.textInput}
                fullWidth
                color='primary'
                type='text'
                variant='outlined'
                value={name}
                onChange={handleNameChange}
              />
            </Grid>
          </Slide>
          <Slide
            className={classes.slideContainer}
            direction={directionForStepIndex(1)}
            in={step === 1}
            mountOnEnter
            unmountOnExit
            exit={false}
          >
            <Grid
              className={classes.inputContainer}
              item
              xs={10}
              sm={8}
              md={6}
              lg={5}
            >
              <Typography
                className={classes.inputLabel}
                variant='body2'
                color='textSecondary'
              >
                Describe yourself in one word
              </Typography>
              <TextField
                className={classes.textInput}
                fullWidth
                color='primary'
                type='text'
                variant='outlined'
                value={descriptor}
                onChange={handleDescriptorChange}
              />
            </Grid>
          </Slide>
          <Slide
            className={classes.slideContainer}
            direction={directionForStepIndex(2)}
            in={step === 2}
            mountOnEnter
            unmountOnExit
            exit={false}
          >
            <Grid className={classes.inputContainer} item xs={10}>
              <Typography
                className={classes.inputLabel}
                variant='body2'
                color='textSecondary'
              >
                Your Big Lake name is
              </Typography>
              <div className={classes.nameContainer}>
                <Typography className={classes.nameFont} variant='h2'>
                  {bigLakeName}
                </Typography>
              </div>
              {!loading && (
                <Typography
                  className={classes.mapLabel}
                  variant='body2'
                  color='textSecondary'
                >
                  You are located at
                </Typography>
              )}
              <div className={classes.mapContainer}>
                {loading && <CircularProgress color='secondary' />}
                {geo && !loading && (
                  <div className={classes.map}>
                    <LeafletMap
                      bounds={getGeoProps().bounds}
                      zoomControl={false}
                    >
                      <GeoJSON
                        data={geo}
                        style={() => ({
                          color: theme.palette.background.default,
                          weight: 6,
                          fillOpacity: 0,
                        })}
                      />
                      <TileLayer
                        attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                        url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                      />
                      <ZoomControl position='topright' />
                    </LeafletMap>
                  </div>
                )}
              </div>
            </Grid>
          </Slide>
        </Grid>
        <Grid
          className={classes.buttonGroup}
          item
          container
          direction='row'
          justify='center'
          alignItems='center'
          xs={12}
        >
          <Button
            className={classes.backButton}
            disabled={step === 0}
            color='primary'
            variant='contained'
            onClick={handleBack}
          >
            Back
          </Button>
          <Button
            className={classes.nextButton}
            disabled={!name}
            color='primary'
            variant='contained'
            onClick={handleNext}
          >
            {step === 2 ? 'Start over' : 'Next'}
          </Button>
        </Grid>
        <Grid
          className={classes.linkGroup}
          item
          xs={10}
          container
          direction='row'
          justify='flex-end'
        >
          <Typography
            className={classes.linkFont}
            variant='body1'
            align='right'
          >
            <span>
              Questions? Watch the{' '}
              <a
                className={classes.link}
                href='https://twitter.com/GLucasTalkShow'
              >
                George Lucas Talk Show
              </a>
            </span>
            <br />
            <span>
              <a className={classes.link} href='https://1600penn.me'>
                1600Penn.me
              </a>
            </span>
            <br />
            <span>
              <a className={classes.link} href='https://arliss.me'>
                Arliss.me
              </a>
            </span>
            <br />
            <span>
              <a
                className={classes.link}
                href='https://github.com/mstubna/biglake.me'
              >
                Source
              </a>
            </span>
          </Typography>
        </Grid>
      </div>
    </ThemeProvider>
  )
}

export default IndexPage
