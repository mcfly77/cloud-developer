
import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'
import { JwtToken } from '../../auth/JwtToken'
import { verify } from 'jsonwebtoken'


const cert = `-----BEGIN CERTIFICATE-----
MIIDBzCCAe+gAwIBAgIJButdqvVNtYnKMA0GCSqGSIb3DQEBCwUAMCExHzAdBgNV
BAMTFnJlaXRtYXllci5ldS5hdXRoMC5jb20wHhcNMjEwMjE0MTEwNjE3WhcNMzQx
MDI0MTEwNjE3WjAhMR8wHQYDVQQDExZyZWl0bWF5ZXIuZXUuYXV0aDAuY29tMIIB
IjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAw7h/2ESzie5uAnBB+Br8Vbpa
Br80htdDwEaeFPLuOthDFM9GuuKcBrlGrEyDn5GS/9yM4nCiiQFPN+VmhtinchTY
YIYHSNww+p8G3nPon0UTRv3es4ln/nYotP6mo5r4yicnvNopTsoFR0TtgigxHoqa
lq3VJuUfgMygwiW33K/fvo3bTYewArZ+o7OajfYatwQk6fdPVVIJZUMdw/U2sXAf
RMVVn4DBn4ARHIWhRv/xdBaw9sboRTABJFQPC+4OZUmwpJl4xXe4ferQ4Ezc24bU
AaPfPFFGd6/JtuDcv8/e/G9iXkGu02IFlqcYZZtrfXndl1Ds2kiOncAFfWC61QID
AQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBTRPU4JY5X+bnz10Yb0
VXaX8aCpqTAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQELBQADggEBAIgOssNC
FyuNghmu835k2n6jIAiKGGwzapMHwJ8HQLK6nNqOTGWr/SSa1+eaN9qJqmpiRrua
k9Vr5iCwIeHWQ/XPqxLvPLcwFksgsYAyuLTsPaYoFajVm5mtLtIkQa4tPJFWKE9w
Vj1X8hZZmXBwIMQQvz96D14RaHOVks32Fv/2XJOyT6EJ5x2rROkAB1W/wL0e+9pz
7QsLPQko1iGSdquBWRybbtvb3eu/PhSn8/Am+J5inRccg1MuEGgN2IpFi3aXtKjy
p4Q8eLLMgI1arKSZuJcMD+RoV3Jqs7owf0CF6PBYes0XiACIdv5TVebC1uyzr/YU
rXrFW9fkCBEFCss=
-----END CERTIFICATE-----`;

export const handler = async (event: CustomAuthorizerEvent): Promise<CustomAuthorizerResult> => {

  const authHeader = event.headers.Authorization;

  try {
    const jwtToken = verifyToken(authHeader);
    console.log('User was authorized', jwtToken);

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    console.log('User bot authorized', e.message)

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }

  }

}



function verifyToken(authHeader: string): JwtToken {
  if (!authHeader)
    throw new Error('No authentication header');

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header');

  const split = authHeader.split(' ')
  const token = split[1]

  return verify(token, cert, { algorithms: ['RS256'] }) as JwtToken
}

