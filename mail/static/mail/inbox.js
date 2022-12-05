document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  
  // Adding onclick attribute

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email-view').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';


}

function send_email() {


  recipients = document.querySelector('#compose-recipients').value;
  console.log(recipients);
  subject = document.querySelector('#compose-subject').value;
  body = document.querySelector('#compose-body').value;


  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: recipients,
      subject: subject,
      body: body
    })
  })
  .then(response => response.json())
  .then(result => {
    load_mailbox("sent");
    // If there is an error display it
    if (result['error']) {

    }
  })
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  let email_view = document.querySelector('#emails-view');
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';

  // Show the mailbox & name
  email_view.style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Grab from API list of emails

  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    let mailCont = document.createElement('div')
    for (email in emails) {
      // Creating DOM elements
      let mail = document.createElement('a');
      let sender = document.createElement('small');
      let subject = document.createElement('span');
      let timestamp = document.createElement('small');
      // div to hold Subject & sender
      let subjFrom = document.createElement('div');
      let subjDiv = document.createElement('div');

      const info = emails[email];

      // Adding the information from the API to the elements
      sender.innerHTML = info.sender;
      subject.innerHTML = info.subject;
      timestamp.innerHTML = info.timestamp;
      const isRead = info.read;
      const emailID = info.id;
      // Adding class to mail div
      mailCont.classList.add('list-group');
      mailCont.setAttribute("id", "mailCont");
      // List group component https://getbootstrap.com/docs/5.2/components/list-group/
      mail.classList.add('list-group-item');
      mail.classList.add('list-group-item-action');

      // if email is not read, show that
      if (!isRead) {
        mail.classList.add('active');
      }

      // Styling subject div
      subjDiv.classList.add('d-inline-block');
      subjDiv.classList.add('text-truncate');

      // adding attribute for mailID
      // mail.setAttribute("inboxID", `${emailID}`);

      // styling the individual emails
      mail.classList.add('d-flex');
      mail.classList.add('w-100');
      mail.classList.add('justify-content-between');
      mail.classList.add('align-items-center');
      mail.classList.add('pointer');

      // Styling subjFrom
      subjFrom.classList.add('d-flex');
      subjFrom.classList.add('w-75');
      subjFrom.classList.add('p3');
      subjFrom.classList.add('align-items-center');
      // styling subject
      subject.classList.add('subject');
      subject.classList.add('text-trucate');
      subject.classList.add('d-inline-block');
      // Adding all the stuff to the correct divs/cont...
      mail.appendChild(subjFrom);
      subjDiv.appendChild(subject);
      subjFrom.appendChild(sender);
      subjFrom.appendChild(subjDiv);
      mail.appendChild(timestamp);

      // Display the emails
      mailCont.append(mail);
      email_view.appendChild(mailCont);


      // when u click the email
      mail.addEventListener('click', () => view_email(emailID));
    }
  })
}

function view_email(emailID) {
  
  // Show the email and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';


  document.querySelector('#email-view').innerHTML = '';
  // Show the email
  document.querySelector('#email-view').style.display = 'block';
    // Create a div and store general information
  const info = document.createElement('div');
  const contentDiv = document.createElement('div');
  const from = document.createElement('p');
  const to = document.createElement('p');
  const Subject = document.createElement('p');
  const timeStamp = document.createElement('p');

  fetch(`emails/${emailID}`)
  .then(response => response.json())
  .then(email => {
    
    // create a div for the content
    // Create the HTML for info related to email
    from.innerHTML = `<bold>From:</bold> ${email.sender}`;
    to.innerHTML = `<bold>To:</bold> ${email.recipients}`
    Subject.innerHTML = `<bold>Subject:</bold> ${email.subject}`
    timeStamp.innerHTML = `<bold>Timestamp:</bold> ${email.timestamp}`
    // Create Reply Button
    let reply = document.createElement('button');
    reply.innerHTML = "Reply";
    reply.classList.add("btn", 'btn-sm', 'btn-outline-primary');
    reply.setAttribute('id', 'reply');

    // Create Archive Button
    let archiveButton = document.createElement('button');
    if (email.archived == false) {
      archiveButton.innerHTML = "Archive";
      archiveButton.classList.add("btn", "btn-sm", "btn-outline-primary");
      archiveButton.setAttribute('id', 'archive');
    }
    else if (email.archived == true) {
      archiveButton.innerHTML = "Archived";
      archiveButton.classList.add("btn", "btn-sm", "btn-primary");
      archiveButton.setAttribute('id', 'archive');
    }
    // creating the content
    let content = document.createElement('p');
    content.innerHTML = email.body;
    contentDiv.appendChild(content);
    // Styling content div
    contentDiv.classList.add("divider");

    // adding info to info div & content to content div
    info.appendChild(from);
    info.appendChild(to);
    info.appendChild(Subject);
    info.appendChild(timeStamp);
    info.appendChild(reply);  
    info.appendChild(archiveButton);
    info.appendChild(contentDiv);

    // If the email wasn't read before, set it to read
    if (email.read == false) {
      fetch(`/emails/${emailID}`, {
        method: 'PUT',
        body: JSON.stringify({
          read: true
        })
      });
    };


    document.querySelector('#email-view').append(info);
    // if they decide to archive the email
    document.querySelector("#archive").addEventListener('click', () => {
      let bNew = email.archived;
      bNew = !bNew;
      fetch(`/emails/${emailID}`, {
        method: 'PUT',
        body: JSON.stringify({
          archived: bNew
        })
      });
      window.location.reload();
    });

    // reply button
    document.querySelector("#reply").addEventListener('click', () => {
      compose_email();
      document.querySelector('#compose-recipients').value = `${email.recipients}`;
      document.querySelector('#compose-subject').value = `${email.subject}`;
      if (!email.subject.includes('Re')) {
        document.querySelector('#compose-subject').value = `Re: ${email.subject}`;
      }
      document.querySelector('#compose-subject').setAttribute('disabled', null);
      document.querySelector('#compose-recipients').setAttribute('disabled', null);
      document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote: ${email.body}`;
    })

  })

}