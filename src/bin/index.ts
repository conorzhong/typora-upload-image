#!/usr/bin/env node
import { register as registerTencent } from '../cloud/tencent'

async function main() {
  await registerTencent()
}

main()
