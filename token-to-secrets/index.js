const core = require('@actions/core');
const zero = require('@zerosecrets/zero').zero

let zeroToken

try {
  // `zero-token` input defined in action metadata file
  zeroToken = core.getInput('zero-token');
}
catch(error) {
  core.setFailed(error.message ?? 'Looks like there is no `zero-token` input');
}

let apis

try {
  // `apis` input defined in action metadata file
  apis = core.getInput('apis').split(',').map(api => api.trim())
} catch (error) {
  core.setFailed(error.message ?? 'Looks like there is no `apis` input');
}

const fetchSecrets = ({token, apis}) => {
  return await zero({token, apis}).fetch()
}

let secrets

try {
  secrets = fetchSecrets({token: zeroToken, apis})
} catch(error) {
  core.setFailed(error.message ?? 'Failed to fetch zero secrets, check you provide right credentials');
}

try {
  // `zero-secrets` output defined in action metadata file
  core.setOutput('zero-secrets', secrets)
} catch(error) {
  core.setFailed(error.message ?? 'Looks like there is no `zero-secrets` output');
}

/*
  Expose every secret as ENV variables with `ZER_SECRET_` prefix
  thus: awesome_secret will be ZERO_SECRET_AWESOME_SECRET
*/
apis.map(api => secrets[api]).forEach(secret => {
  Object.entries(secret).forEach(([name, value]) => {
    try {
      core.exportVariable(`ZERO_SECRET_${name.toLocaleUpperCase()}`, value)
    } catch(error) {
      core.setFailed(error.message ?? `Cannot EXPORT \"${name}\" secret as environment variable`);
    }
  })
})
