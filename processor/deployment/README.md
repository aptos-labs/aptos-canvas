# Deployment

This directory contains a very basic deployment setup using Ansible, just deploying the processors and DB to a single cloud compute instance.

## Expected conditions of the remote server to begin with
- A user called `dport` with sudo power exists with SSH key based access already set up
- Python 3 installed at the location set in `hosts`
- The server is running Debian 11.


## Variables
We just put the non-secret vars in the playbook.

You must also set the following secret vars:
- `auth_token`

## Running this playbook
```
poetry run ansible-playbook -i hosts main.yaml --extra-vars "auth_token=todo" --tags config
```

To deploy this to my personal server, see banool/server-setup.
