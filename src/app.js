import { initialize } from "@frontegg/js";
import "./styles/globals.css";
import { createAccountInfo } from "./components/accountInfo";
import { DEFAULT_SANDBOX_CONTEXT, ELEMENT_IDS } from "./constants/config";

const frontegg = initialize({
  contextOptions: {
    baseUrl: DEFAULT_SANDBOX_CONTEXT.baseUrl,
    clientId: DEFAULT_SANDBOX_CONTEXT.clientId,
  },
  hostedLoginBox: true,
});

const elements = {
  logoutBtn: document.getElementById(ELEMENT_IDS.logoutBtn),
  loginBtn: document.getElementById(ELEMENT_IDS.loginBtn),
  welcomeContent: document.getElementById(ELEMENT_IDS.welcomeContent),
  signupBanner: document.getElementById(ELEMENT_IDS.signupBanner),
};

function updateUI(state) {
  try {
    const { isAuthenticated, user, tenantsState } = state.auth;
    
    elements.logoutBtn.style.display = isAuthenticated ? "block" : "none";
    elements.welcomeContent.style.display = isAuthenticated ? "none" : "flex";

    if (isAuthenticated && user) {
      updateAuthenticatedUI(user, tenantsState);
    } else {
      removeAccountInfo();
    }
  } catch (error) {
    console.error("Error updating UI:", error.message);
  }
}

function updateAuthenticatedUI(user, tenantsState) {
  removeAccountInfo();
  
  const accountInfoElement = createAccountInfo(
    user,
    tenantsState.tenants,
    tenantsState.activeTenant,
    (tenant) => frontegg.switchTenant({ tenantId: tenant.tenantId }),
    frontegg
  );

  if (accountInfoElement) {
    elements.welcomeContent.parentNode.insertBefore(
      accountInfoElement,
      elements.welcomeContent.nextSibling
    );
  }
}

function removeAccountInfo() {
  const accountInfoBlock = document.getElementById(ELEMENT_IDS.accountInfo);
  if (accountInfoBlock) {
    accountInfoBlock.remove();
  }
}

elements.logoutBtn.addEventListener("click", () => frontegg.logout());
elements.loginBtn.addEventListener("click", () => frontegg.loginWithRedirect());

frontegg.addOnLoadedListener(() => {
  const state = frontegg.store.getState().root.context;
  const isSandboxEnvironment = 
    state.baseUrl === "https://sandbox.frontegg.com" && 
    state.clientId === "9af126b9-c35f-4e2d-a3f1-c261e22aaf4a";
    
  if (isSandboxEnvironment) {
    elements.signupBanner.style.display = "block";
  }
});

frontegg.store.subscribe(() => updateUI(frontegg.store.getState()));
