import { sbs1Host, sbs1Port } from './config'

import { createClient } from 'sbs1'

const sbs1Options = {
  host: sbs1Host,
  port: sbs1Port
}

export const sbs1Client = createClient(sbs1Options)
