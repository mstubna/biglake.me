import { useEffect } from 'react'
import { navigate } from 'gatsby'

const TestPage = () => {
  useEffect(() => {
    navigate('/')
  }, [])

  return ''
}

export default TestPage
