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
  duration,
} from '@material-ui/core/styles'
import capitalize from 'lodash/capitalize'
import { findBestMatchForName, getGeo } from '../utilities'
import pin from '../images/pin.png'
import icon from '../images/icon.png'
import '../index.css'
import '../../node_modules/leaflet/dist/leaflet.css'
import leaflet from 'leaflet/dist/leaflet'
const {
  Map: LeafletMap,
  GeoJSON,
  Marker,
  TileLayer,
  ZoomControl,
} = require('react-leaflet')

let pointerIcon
if (typeof window !== 'undefined') {
  pointerIcon = new leaflet.Icon({
    iconUrl: pin,
    iconAnchor: [20, 80],
    iconSize: [80, 80],
  })
}

const hFonts = {
  fontFamily: "'Eclat', 'Times New Roman', Times, serif",
}
let theme = createMuiTheme({
  typography: {
    fontSize: 16,
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
    primary: { main: '#212121' },
    secondary: { main: '#424242' },
    text: {
      primary: '#212121',
      secondary: '#424242',
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
          borderColor: '#212121',
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
    color: theme.palette.text.primary,
  },
  subtitleContainer: {
    marginTop: 10,
  },
  subtitleFont: {},
  inputContainer: {},
  inputLabel: {
    textAlign: 'center',
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
  mapParentContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -30,
  },
  mapContainer: {
    marginTop: 20,
    marginBottom: 20,
    borderColor: 'white',
    borderWidth: 30,
    borderStyle: 'solid',
    borderBottomWidth: 190,
    boxShadow: '1px 8px 11px #000000d9',
    width: '100%',
    maxWidth: 650,
    height: 750,
  },
  mapLabel: {
    textAlign: 'center',
    marginTop: 20,
  },
  map: {
    height: '100%',
    width: '100%',
  },
  mapName: {
    textAlign: 'center',
    lineHeight: 0.9,
    marginTop: 20,
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
    const names = []
    if (descriptor) {
      names.push(capitalize(descriptor))
    }
    names.push(match.name)
    setBigLakeName(names.join(' '))
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
    const center = bounds.getCenter()
    return {
      center: [center.lat, center.lng],
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
        <meta property='og:image' content={icon} />
        <meta property='og:url' content='https://biglake.me' />
        <meta name='twitter:title' content='BigLake.me' />
        <meta name='twitter:description' content='Big Lake name generator' />
        <meta name='twitter:image' content={icon} />
        <meta name='twitter:card' content={icon} />
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
            <Typography
              className={classes.subtitleFont}
              variant='body1'
              color='textSecondary'
            >
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
            timeout={!prevStep ? 0 : duration.standard}
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
            </Grid>
          </Slide>
          <Grid className={classes.mapParentContainer} item xs={10}>
            {step === 2 && loading && <CircularProgress color='primary' />}
            {step === 2 && geo && !loading && (
              <>
                <div className={classes.mapContainer}>
                  <div className={classes.map}>
                    <LeafletMap
                      bounds={getGeoProps().bounds}
                      zoomControl={false}
                    >
                      <GeoJSON
                        data={geo}
                        style={() => ({
                          color: '#b71c1c',
                          weight: 6,
                          fillOpacity: 0,
                        })}
                      />
                      <TileLayer
                        attribution='Tiles &copy;Esri&mdash;Source: Esri, DeLorme, et. al.'
                        url='https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}'
                      />
                      <ZoomControl position='topright' />
                      <Marker
                        position={getGeoProps().center}
                        icon={pointerIcon || null}
                      />
                    </LeafletMap>
                  </div>
                  <Typography className={classes.mapName} variant='h2'>
                    {bigLakeName}
                  </Typography>
                </div>
              </>
            )}
          </Grid>
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
            color='textSecondary'
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
