import * as core from '@actions/core'
import * as semver from 'semver'
import axios from 'axios'
import * as jq from 'node-jq'
import {Convert, Response} from './response'
//import {wait} from './wait'

async function run(): Promise<void> {
  try {
    const repoName = core.getInput('repo-name', {required: true})
    //const repoName = "elastic/apm-server"

    let url =
      'https://hub.docker.com/v2/repositories/' +
      repoName +
      '/tags?page_size=100'
    const res = await axios.get<Response[]>(url)
    const response = Convert.toResponse(JSON.stringify(res.data))

    const filter = '.results | map(.name)'
    const result = await jq.run(filter, response, {input: 'json', output: 'json'})
    console.log(result)
    const versions = JSON.parse(JSON.stringify(result))

    const latest = semver.maxSatisfying(versions, '*')
    console.log(latest)
    core.setOutput('latest', latest)
    core.exportVariable('latest', latest)
  } catch (error) {
    console.log(error)
  }
}

run()
