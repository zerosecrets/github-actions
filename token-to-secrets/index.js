const core = require('@actions/core');
const zero = require('@zerosecrets/zero').zero

const main = async () => {
  let zeroToken

  try {
    // `zero-token` input defined in action metadata file
    zeroToken = core.getInput('zero-token');
  } catch (error) {
    core.setFailed(error.message ?? 'Looks like there is no `zero-token` input');
  }

  let apis

  try {
    // `apis` input defined in action metadata file
    apis = core.getInput('apis').split(',').map(api => api.trim().toLowerCase())
  } catch (error) {
    core.setFailed(error.message ?? 'Looks like there is no `apis` input');
  }

  let callerName

  try {
    // `callerName` input defined in action metadata file
    callerName = core.getInput('callerName');
  } catch (error) {
    core.setFailed(error.message ?? 'Looks like there is no `callerName` input');
  }

  let secrets

  try {
    secrets = await zero({token: zeroToken, pick: apis, callerName: callerName === "none" ? undefined : callerName}).fetch()
  } catch(error) {
    core.setFailed(error.message ?? 'Failed to fetch zero secrets, check you provide right credentials');
  }

  try {
    // `zero-secrets` output defined in action metadata file
    core.setOutput('zero-secrets', secrets)
  } catch (error) {
    core.setFailed(error.message ?? 'Looks like there is no `zero-secrets` output');
  }

  /*
    Expose every secret as ENV variables with `ZER_SECRET_` prefix
    thus: awesome_secret will be ZERO_SECRET_AWESOME_SECRET
  */

  apis.map(api => [secrets[api], api]).forEach(([secret, api]) => {
    if (typeof secret === 'undefined') {
      throw new Error(`Looks like there is no secret for ${api} API`)
    }

    Object.entries(secret).forEach(([name, value]) => {
      try {
        core.exportVariable(`ZERO_SECRET_${name.toLocaleUpperCase()}`, value)
      } catch (error) {
        core.setFailed(error.message ?? `Cannot EXPORT \"${name}\" secret as environment variable`);
      }
    })
  })
}

main()
