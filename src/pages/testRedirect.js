import { useEffect } from 'react'
import { navigate } from 'gatsby'

const IndexPage = () => {
  useEffect(() => {
    navigate('/')
  }, [])

  return ''
}

export default IndexPage
