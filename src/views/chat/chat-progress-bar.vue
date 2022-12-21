<template>
  <div class="container-progress-bar">
    <div class="progress-bar">

      <div class="step">
        <div class="text-truncate">
          <p>Accept</p>
        </div>
        <div class="bullet active">
          <span>1</span>
        </div>
        <div class="check fas fa-check active">
        </div>
      </div>

      <div class="step">
        <div class="text-truncate">
          <p>Confirm</p>
        </div>
        <div class="bullet active">
          <span>2</span>
        </div>
        <div class="check fas fa-check active">
        </div>
      </div>

      <div class="step current-step">
        <div class="text-truncate">
          <p>Payment</p>
        </div>
        <div class="bullet current-bullet">
          <span>3</span>
        </div>
        <div class="check fas fa-check">
        </div>
      </div>

      <div class="step">
        <div class="text-truncate">
          <p>Confirmation</p>
        </div>
        <div class="bullet">
          <span>4</span>
        </div>
        <div class="check fas fa-check">
        </div>
      </div>

      <div class="step">
        <div class="text-truncate">
          <p>Shipping</p>
        </div>
        <div class="bullet">
          <span>5</span>
        </div>
        <div class="check fas fa-check">
        </div>
      </div>

      <div class="step">
        <div class="text-truncate">
          <p>Resolution</p>
        </div>
        <div class="bullet">
          <span>6</span>
        </div>
        <div class="check fas fa-check">
        </div>
      </div>

      <div class="step">
        <div class="text-truncate">
          <p>Finished</p>
        </div>
        <div class="bullet">
          <span>7</span>
        </div>
        <div class="check fas fa-check">
        </div>
      </div>
    </div>
  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css?family=Poppins:400,500,600,700&display=swap');
*{
  margin: 0;
  padding: 0;
  outline: none;
  font-family: 'Poppins', sans-serif;
}

::selection{
  color: #fff;
  background: #d43f8d;
}

.container-progress-bar{
  position: absolute;
  margin-top: 53px;
  z-index: 10;
  width: 100%;
  padding: 5px 0;
  border-bottom: solid 2px #eff2f7;
  background: #fff;
}

[data-layout-mode="dark"] .container-progress-bar{
  border-bottom: solid 1px #31384d;
  background: #2a3042;
}

.container-progress-bar .progress-bar{
  display: grid!important;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr 1fr!important;
  user-select: none;
  max-width: 560px;
  margin: 0 auto;
}
.container-progress-bar .progress-bar .step{
  text-align: center;
  width: 100%;
  position: relative;
}
.container-progress-bar .progress-bar .step p{
  font-weight: 500;
  font-size: 12px;
  color: #000;
  margin-bottom: 8px;
}

[data-layout-mode="dark"] .container-progress-bar .progress-bar .step p{
  color: rgb(195, 203, 228);
}

[data-layout-mode="dark"] .progress-bar .step .bullet{
  border-color: rgb(195, 203, 228);
  background-color: rgb(193, 201, 227);
}

.progress-bar .step .bullet{
  height: 25px;
  width: 25px;
  border: 2px solid rgb(116, 120, 141);
  display: inline-block;
  border-radius: 50%;
  position: relative;
  transition: 0.2s;
  font-weight: 500;
  font-size: 12px;
  line-height: 20px;
  background-color: rgb(195, 203, 228);
  color: #000;
}

.current-bullet{
  border-color:#485ec4!important;
  color:#fff!important;
  background-color: #485ec4!important;
}

.current-step{
  cursor: pointer;
}

.progress-bar .step .bullet.active{
  border-color: #d43f8d;
  background: #d43f8d;
}
.progress-bar .step .bullet span{
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}
.progress-bar .step .bullet.active span{
  display: none;
}
.progress-bar .step .bullet:before,
.progress-bar .step .bullet:after{
  position: absolute;
  content: '';
  bottom: 11px;
  right: -51px;
  height: 3px;
  width: 44px;
  background: #262626;
}

[data-layout-mode="dark"] .progress-bar .step .bullet:before,
.progress-bar .step .bullet:after{
  background: rgb(193, 201, 227);
}

.progress-bar .step .bullet.active:after{
  background: #d43f8d;
  transform: scaleX(0);
  transform-origin: left;
  animation: animate 0.3s linear forwards;
}
@keyframes animate {
  100%{
    transform: scaleX(1);
  }
}
.progress-bar .step:last-child .bullet:before,
.progress-bar .step:last-child .bullet:after{
  display: none;
}
.progress-bar .step p.active{
  color: #d43f8d;
  transition: 0.2s linear;
}
.progress-bar .step .check{
  position: absolute;
  left: 50%;
  top: 70%;
  font-size: 15px;
  transform: translate(-50%, -50%);
  display: none;
}
.progress-bar .step .check.active{
  display: block;
  color: #fff;
}

@media (max-width: 950px){
  .progress-bar .step .bullet:before,
  .progress-bar .step .bullet:after{
    display: none;
  }
}

@media (max-width: 768px){
  .progress-bar .step .bullet:before,
  .progress-bar .step .bullet:after{
    display: block;
  }
}

@media (max-width: 590px){
  .progress-bar .step .bullet:before,
  .progress-bar .step .bullet:after{
    display: none;
  }

  .container-progress-bar .progress-bar .step p{
    font-size: 8px;
  }
}
</style>