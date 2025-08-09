import './assets/main.css'

import '@phosphor-icons/web/light'
import '@phosphor-icons/web/bold'

import { render } from 'solid-js/web'
import App from './App'

render(() => <App />, document.getElementById('root') as HTMLElement)
