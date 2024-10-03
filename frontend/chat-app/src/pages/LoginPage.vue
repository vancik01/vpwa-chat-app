<template>
    <q-page class="row flex-center">
        <div class="col-xs-12 col-sm-8 col-md-6 col-lg-4 col-xl-3">
      <q-card class="q-pa-md q-pa-sm-none">
        <q-card-section>
          <div class="text-h5 text-center text-weight-bold">Login</div>
        </q-card-section>
  
        <q-card-section>
          <q-form @submit="onSubmit" ref="form">
            <q-input filled v-model="email" label="Email" type="email" :rules="[val => !!val || 'This field is required']"/>
            <q-input filled v-model="password" label="Password" type="password" class="q-mt-md" :rules="[val => !!val || 'This field is required']"/>
            <q-btn no-caps type="submit" label="Log in" color="primary" class="full-width q-mt-md"/>
          </q-form>
        </q-card-section>
  
        <q-card-actions align="center">
            <div class="q-mt-lg">
                <span>Not a user yet? </span>
                <router-link to="/auth/register" class="text-primary">Create account</router-link>
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
      email: '',
      password: ''
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