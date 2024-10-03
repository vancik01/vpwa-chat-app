<template>
    <q-page class="row flex-center">
        <div class="col-xs-12 col-sm-8 col-md-6 col-lg-4 col-xl-3">
      <q-card class="q-pa-md q-pa-sm-none">
        <q-card-section>
          <div class="text-h5 text-center text-weight-bold">Create Account</div>
        </q-card-section>
  
        <q-card-section>
          <q-form @submit="onSubmit" ref="form">
            <div class="row q-col-gutter-md">
              <div class="col-6">
                <q-input filled v-model="firstName" label="First Name *" :rules="[val => !!val || 'This field is required']"/>
              </div>
              <div class="col-6">
                <q-input filled v-model="lastName" label="Last Name *" :rules="[val => !!val || 'This field is required']"/>
              </div>
            </div>
            <q-input filled v-model="nickname" label="Nickname *" class="q-mt-md" :rules="[val => !!val || 'This field is required']"/>
            <q-input filled v-model="email" label="Email *" type="email" class="q-mt-md" :rules="[val => !!val || 'This field is required']"/>
            <q-input filled v-model="password" label="Password *" type="password" class="q-mt-md" :rules="[val => !!val || 'This field is required']"/>
            <q-input filled v-model="repeatPassword" label="Repeat Password *" type="password" class="q-mt-md" :rules="[val => val === password || 'Passwords must match']"/>
            <q-btn no-caps type="submit" label="Create account" color="primary" class="full-width q-mt-md"/>
          </q-form>
        </q-card-section>
  
        <q-card-actions align="center">
            <div class="q-mt-lg">
                <span>Already have an acconut? </span>
                <router-link to="/auth/login" class="text-primary">Log in</router-link>
          </div>
        </q-card-actions>
      </q-card>
    </div>
    </q-page>
  </template>

<script>
export default {
  data() {
    return {
      firstName: '',
      lastName: '',
      nickname: '',
      email: '',
      password: '',
      repeatPassword: ''
    };
  },
  methods: {
    onSubmit() {
      const formIsValid = this.$refs.form.validate();
      if (formIsValid) {
        this.$router.push('/');
      }
    }
  }
};
</script>

<style scoped>
@media (max-width: 600px) {
  .q-card {
    border: none;
    box-shadow: none;
  }
}
</style>